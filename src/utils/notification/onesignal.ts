// src/services/oneSignal.ts
import axios from "axios";

interface SendNotificationOptions {
  title: string;
  message: string;
  subtitle?: string; // if targeting specific device IDs
  externalIds?: string[]; // if targeting by external user IDs / aliases
  tags?: { key: string; relation?: "=" | "!="; value: string }[]; // if targeting by tags
  data?: Record<string, any>;
  url?: string; // opens when user taps notification
}

export async function sendNotification(
  opts: SendNotificationOptions
): Promise<any> {
  if (!process.env.ONESIGNAL_APP_ID) {
    throw new Error("ONESIGNAL_APP_ID is not set in environment");
  }
  if (!process.env.ONESIGNAL_APP_API_KEY) {
    throw new Error("ONESIGNAL_APP_API_KEY is not set in environment");
  }

  const { title, message, subtitle, externalIds, tags, data, url } = opts;

  const body: any = {
    app_id: process.env.ONESIGNAL_APP_ID,
    contents: { en: message },
    headings: { en: title },
    url: url,
    data: data,
  };

  if (subtitle) {
    body.subtitle = { en: subtitle };
  }

  if (externalIds && externalIds.length > 0) {
    body.include_aliases = { external_id: externalIds };
    body.target_channel = "push";
  }

  if (tags && tags.length > 0) {
    body.filters = tags.flatMap((tag, i) => {
      const filter = {
        field: "tag",
        key: tag.key,
        relation: tag.relation ?? "=",
        value: tag.value,
      };
      // Add "OR" operator between multiple tags
      return i === 0 ? [filter] : [{ operator: "OR" }, filter];
    });
  }

  try {
    const resp = await axios.post(
      "https://api.onesignal.com/notifications?c=push",
      body,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Key ${process.env.ONESIGNAL_APP_API_KEY}`,
        },
      }
    );
    console.log("✅ OneSignal notification response:", resp.data);
    return resp.data;
  } catch (error: any) {
    console.error("❌ OneSignal error:", error.response?.data ?? error.message);
    throw error;
  }
}
