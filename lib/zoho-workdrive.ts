import type { ArchitectureReviewReport } from "@/lib/architecture-review/types";

function hasWorkDriveRefreshCredentials() {
  return (
    Boolean(process.env.ZOHO_WORKDRIVE_REFRESH_TOKEN || process.env.ZOHO_CRM_REFRESH_TOKEN) &&
    Boolean(process.env.ZOHO_WORKDRIVE_CLIENT_ID || process.env.ZOHO_CLIENT_ID) &&
    Boolean(process.env.ZOHO_WORKDRIVE_CLIENT_SECRET || process.env.ZOHO_CLIENT_SECRET)
  );
}

function getAccountsDomain() {
  return process.env.ZOHO_WORKDRIVE_ACCOUNTS_DOMAIN ?? process.env.ZOHO_ACCOUNTS_DOMAIN ?? "https://accounts.zoho.com";
}

function getBaseApiUri() {
  return process.env.ZOHO_WORKDRIVE_BASE_API_URI ?? "zohoapis.com";
}

function getWorkDriveFolderId() {
  return process.env.ZOHO_WORKDRIVE_FOLDER_ID ?? "";
}

async function refreshWorkDriveAccessToken() {
  if (!hasWorkDriveRefreshCredentials()) {
    return null;
  }

  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: process.env.ZOHO_WORKDRIVE_REFRESH_TOKEN ?? process.env.ZOHO_CRM_REFRESH_TOKEN!,
    client_id: process.env.ZOHO_WORKDRIVE_CLIENT_ID ?? process.env.ZOHO_CLIENT_ID!,
    client_secret: process.env.ZOHO_WORKDRIVE_CLIENT_SECRET ?? process.env.ZOHO_CLIENT_SECRET!,
  });

  const response = await fetch(`${getAccountsDomain().replace(/\/$/, "")}/oauth/v2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as { access_token?: string };
  if (!payload.access_token) {
    return null;
  }

  return payload.access_token;
}

async function getWorkDriveAccessToken() {
  const direct = process.env.ZOHO_WORKDRIVE_ACCESS_TOKEN ?? process.env.ZOHO_CRM_ACCESS_TOKEN;
  if (direct) {
    return direct;
  }

  return refreshWorkDriveAccessToken();
}

function extractWorkDriveFileId(body: unknown) {
  if (!body || typeof body !== "object") {
    return null;
  }

  const data = (body as { data?: unknown }).data;
  if (Array.isArray(data) && data.length > 0) {
    const first = data[0] as { id?: string; attributes?: { resource_id?: string; id?: string } };
    return first?.id ?? first?.attributes?.resource_id ?? first?.attributes?.id ?? null;
  }

  if (data && typeof data === "object") {
    const single = data as { id?: string; attributes?: { resource_id?: string; id?: string } };
    return single.id ?? single.attributes?.resource_id ?? single.attributes?.id ?? null;
  }

  return null;
}

async function uploadFile(input: {
  token: string;
  folderId: string;
  filename: string;
  mimeType: string;
  bytes: Uint8Array;
}) {
  const endpoint = `https://workdrive.${getBaseApiUri()}/api/v1/upload`;
  const form = new FormData();
  form.append("filename", input.filename);
  form.append("parent_id", input.folderId);
  form.append("override-name-exist", "false");
  form.append("content", new Blob([Buffer.from(input.bytes)], { type: input.mimeType }), input.filename);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.token}`,
    },
    body: form,
  });

  const bodyText = await response.text();
  let parsedBody: unknown = null;
  try {
    parsedBody = JSON.parse(bodyText);
  } catch {
    parsedBody = bodyText;
  }

  if (!response.ok) {
    return {
      ok: false,
      fileId: null,
      error: `WORKDRIVE_${response.status}:${typeof parsedBody === "string" ? parsedBody.slice(0, 300) : JSON.stringify(parsedBody).slice(0, 300)}`,
    } as const;
  }

  return {
    ok: true,
    fileId: extractWorkDriveFileId(parsedBody),
    error: null,
  } as const;
}

function sanitizeFilenamePart(input: string) {
  return input.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 80);
}

export async function archiveArchitectureReviewToWorkDrive(input: {
  diagramFileName: string;
  diagramBytes: Uint8Array;
  report: ArchitectureReviewReport;
  userName: string | null;
  paragraphInput: string;
}) {
  const folderId = getWorkDriveFolderId();
  if (!folderId) {
    return {
      status: "skipped",
      diagramFileId: null,
      reportFileId: null,
      error: "WORKDRIVE_FOLDER_NOT_CONFIGURED",
    } as const;
  }

  const token = await getWorkDriveAccessToken();
  if (!token) {
    return {
      status: "failed",
      diagramFileId: null,
      reportFileId: null,
      error: "WORKDRIVE_ACCESS_TOKEN_NOT_AVAILABLE",
    } as const;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const emailPart = sanitizeFilenamePart(input.report.userEmail);
  const diagramName = `${timestamp}_${emailPart}_${sanitizeFilenamePart(input.diagramFileName) || "diagram.png"}`;

  let diagramUpload = await uploadFile({
    token,
    folderId,
    filename: diagramName,
    mimeType: "image/png",
    bytes: input.diagramBytes,
  });

  if (!diagramUpload.ok) {
    const refreshed = await refreshWorkDriveAccessToken();
    if (!refreshed) {
      return {
        status: "failed",
        diagramFileId: null,
        reportFileId: null,
        error: diagramUpload.error,
      } as const;
    }

    diagramUpload = await uploadFile({
      token: refreshed,
      folderId,
      filename: diagramName,
      mimeType: "image/png",
      bytes: input.diagramBytes,
    });

    if (!diagramUpload.ok) {
      return {
        status: "failed",
        diagramFileId: null,
        reportFileId: null,
        error: diagramUpload.error,
      } as const;
    }
  }

  const reportPayload = {
    userEmail: input.report.userEmail,
    userName: input.userName,
    paragraphInput: input.paragraphInput,
    report: input.report,
  };
  const reportBytes = new TextEncoder().encode(JSON.stringify(reportPayload, null, 2));
  const reportName = `${timestamp}_${emailPart}_architecture-review.json`;

  let reportUpload = await uploadFile({
    token,
    folderId,
    filename: reportName,
    mimeType: "application/json",
    bytes: reportBytes,
  });

  if (!reportUpload.ok) {
    const refreshed = await refreshWorkDriveAccessToken();
    if (refreshed) {
      reportUpload = await uploadFile({
        token: refreshed,
        folderId,
        filename: reportName,
        mimeType: "application/json",
        bytes: reportBytes,
      });
    }
  }

  return {
    status: reportUpload.ok ? "uploaded" : "partial",
    diagramFileId: diagramUpload.fileId,
    reportFileId: reportUpload.fileId,
    error: reportUpload.ok ? null : reportUpload.error,
  } as const;
}
