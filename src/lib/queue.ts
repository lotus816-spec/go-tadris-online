import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";

const conn = () => new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", { maxRetriesPerRequest: null });

export const notifyQueue = () =>
  new Queue("notify", { connection: conn() });

export async function enqueueNotify(job: { channel: string; to: string; body: string; runAt?: number }) {
  const q = notifyQueue();
  await q.add("send", job, job.runAt ? { delay: Math.max(0, job.runAt - Date.now()) } : {});
  await q.close();
}

// يُشغَّل في worker منفصل: `tsx src/lib/worker.ts`
export function startWorker() {
  const w = new Worker(
    "notify",
    async (job) => {
      const { sendMessage } = await import("@/lib/notify");
      await sendMessage(job.data.channel, job.data.to, job.data.body);
    },
    { connection: conn() }
  );
  return w;
}
