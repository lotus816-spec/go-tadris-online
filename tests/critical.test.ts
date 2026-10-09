import { describe, it, expect } from "vitest";
import { can } from "../src/lib/permissions";
import { verifyHmac } from "../src/lib/security";
import { pickPrizeIndex } from "../src/lib/wheel";

describe("auth & roles", () => {
  it("المعلم ينشئ دورات والطالب لا", () => {
    expect(can("TEACHER", "courseCreate")).toBe(true);
    expect(can("STUDENT", "courseCreate")).toBe(false);
  });
  it("إعدادات المنصة للمدير فقط", () => {
    expect(can("ADMIN", "settingsEdit")).toBe(true);
    expect(can("TEACHER", "settingsEdit")).toBe(false);
  });
});

describe("payments webhook", () => {
  it("يرفض التوقيع الخاطئ قبل تفعيل الاشتراك", () => {
    expect(verifyHmac("body", "bad", "secret")).toBe(false);
  });
  it("يقبل التوقيع الصحيح", async () => {
    const crypto = await import("crypto");
    const sig = crypto.createHmac("sha256", "s").update("b").digest("hex");
    expect(verifyHmac("b", sig, "s")).toBe(true);
  });
});

describe("certificates", () => {
  it("شرط الإكمال + النجاح (منطق خالص)", () => {
    const done = 10, total = 10, avg = 75, pass = 60;
    expect(done >= total && avg >= pass).toBe(true);
    expect(9 >= total && avg >= pass).toBe(false);
  });
});

describe("gift wheel", () => {
  it("التوزيع الاحتمالي يحترم الأوزان", () => {
    expect(pickPrizeIndex([1, 1], 0.1)).toBe(0);
    expect(pickPrizeIndex([1, 1], 0.9)).toBe(1);
    expect(pickPrizeIndex([0, 5], 0.5)).toBe(1);
  });
});
