import { useMemo, useState } from "react";
import {
  MeshNameInput,
  useNamedPeer,
  usePerPeerValue,
  useSharedTimer,
  type MeshConfig,
  type YRoom,
} from "@baditaflorin/mesh-common";

const SPRINT_MS = 20 * 60 * 1000;
type Props = { room: YRoom | null; config: MeshConfig };
export function fmt(ms: number): string {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
export function isValidCheckin(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}
function display(id: string, get: (id: string) => string | undefined) {
  return get(id) || `Sprinter ${id.slice(0, 5)}`;
}

export function Feature({ room, config }: Props) {
  const named = useNamedPeer(config, room);
  const timer = useSharedTimer(room, "mesh-habit-sprint:timer", { durationMs: SPRINT_MS });
  const checkins = usePerPeerValue<number>(room, "mesh-habit-sprint:checkins", 0);
  const [habit, setHabit] = useState("Drink a glass of water");
  const done = isValidCheckin(checkins.my);
  const board = useMemo(
    () => checkins.entries.filter(([, value]) => isValidCheckin(value)).sort((a, b) => a[1] - b[1]),
    [checkins.entries],
  );
  const active = timer.state === "running";
  return (
    <main className="sprint-page">
      <section className="hero">
        <div>
          <p className="eyebrow">Mesh Habit Sprint</p>
          <h1>One small promise. Twenty focused minutes.</h1>
          <p>
            Start a shared sprint, check in once when you finish, and see the room’s progress as it
            happens.
          </p>
        </div>
        <div className="clock" aria-live="polite">
          <span>
            {active ? "time remaining" : timer.state === "finished" ? "sprint finished" : "ready"}
          </span>
          <strong>
            {active ? fmt(timer.remainingMs ?? 0) : timer.state === "finished" ? "Done" : "20:00"}
          </strong>
        </div>
      </section>
      <section className="grid">
        <section className="card action">
          <p className="eyebrow">Your challenge</p>
          <label htmlFor="habit">What will you do?</label>
          <input
            id="habit"
            value={habit}
            onChange={(e) => setHabit(e.target.value.slice(0, 80))}
            maxLength={80}
          />
          <MeshNameInput
            label="Your name"
            value={named.name}
            onChange={named.setName}
            placeholder="Name on your check-in"
            maxLength={32}
          />
          {!active ? (
            <button className="primary" onClick={() => timer.start(SPRINT_MS)} disabled={!room}>
              {timer.state === "finished" ? "Start another sprint" : "Start the sprint"}
            </button>
          ) : (
            <button
              className="primary"
              onClick={() => checkins.setMy(Date.now())}
              disabled={!room || done}
            >
              {done ? "Checked in ✓" : "I completed it"}
            </button>
          )}
          <p className="note" role="status">
            {done
              ? "Your check-in is recorded once for this device."
              : active
                ? "A check-in is permanent for this sprint, so it cannot inflate the room total."
                : "Any person in the room can start the shared timer."}
          </p>
        </section>
        <section className="card board">
          <div className="heading">
            <div>
              <p className="eyebrow">Progress board</p>
              <h2>{board.length} completed</h2>
            </div>
            <span>{checkins.size} check-ins</span>
          </div>
          <div className="progress">
            <span style={{ width: `${Math.min(100, board.length * 20)}%` }} />
          </div>
          {board.length ? (
            <ol>
              {board.map(([id, at], index) => (
                <li key={id}>
                  <span>{index + 1}</span>
                  <strong>{display(id, named.nameOf)}</strong>
                  <small>
                    checked in ·{" "}
                    {new Date(at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </small>
                </li>
              ))}
            </ol>
          ) : (
            <p className="empty">The first finished habit lights up the board.</p>
          )}
        </section>
      </section>
    </main>
  );
}
