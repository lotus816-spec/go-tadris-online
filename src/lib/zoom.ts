/** Zoom Meeting SDK / API + مسار بديل */
export async function createZoomMeeting(topic: string, startTime: string, durationMin = 60) {
  if (!process.env.ZOOM_CLIENT_ID) {
    return { id: `local-${Date.now()}`, joinUrl: `${process.env.LIVE_FALLBACK_URL ?? "/live/fallback"}?t=${encodeURIComponent(topic)}` };
  }
  // الحصول على token عبر Server-to-Server OAuth ثم إنشاء اجتماع
  const b64 = Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString("base64");
  const tok = await fetch(`https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`, {
    method: "POST",
    headers: { Authorization: `Basic ${b64}` },
  }).then((r) => r.json());
  const meeting = await fetch("https://api.zoom.us/v2/users/me/meetings", {
    method: "POST",
    headers: { Authorization: `Bearer ${tok.access_token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ topic, type: 2, start_time: startTime, duration: durationMin, settings: { auto_recording: "cloud" } }),
  }).then((r) => r.json());
  return { id: String(meeting.id), joinUrl: meeting.join_url };
}
