import "server-only";
import { getDatabase } from "./database";
import type { SavedData } from "./cloud-data";
export async function readWorkerData(userId: string) {
  const result = await getDatabase().query<{
    data: SavedData;
    revision: number;
  }>("SELECT data, revision FROM aasra_worker_data WHERE user_id = $1", [
    userId,
  ]);
  return result.rows[0] ?? { data: null, revision: 0 };
}
export async function writeWorkerData(
  userId: string,
  data: SavedData,
  revision: number,
) {
  const result =
    revision === 0
      ? await getDatabase().query<{ revision: number }>(
          "INSERT INTO aasra_worker_data (user_id,data,revision) VALUES ($1,$2::jsonb,1) ON CONFLICT (user_id) DO NOTHING RETURNING revision",
          [userId, JSON.stringify(data)],
        )
      : await getDatabase().query<{ revision: number }>(
          "UPDATE aasra_worker_data SET data=$2::jsonb, revision=revision+1, updated_at=now() WHERE user_id=$1 AND revision=$3 RETURNING revision",
          [userId, JSON.stringify(data), revision],
        );
  return result.rows[0]?.revision ?? null;
}
