"use client";

import { FormEvent, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Note = {
  id: string;
  title: string;
  body: string;
  createdAt: number;
};

const NOTES_KEY = "papertrail-notes";
const USER_KEY = "notes-user";
const STORAGE_EVENT = "papertrail-storage-change";

function subscribeToStorage(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(STORAGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(STORAGE_EVENT, onChange);
  };
}

function getUserSnapshot() {
  return typeof window === "undefined" ? "" : window.sessionStorage.getItem(USER_KEY) ?? "";
}

function getNotesSnapshot() {
  return typeof window === "undefined" ? "[]" : window.localStorage.getItem(NOTES_KEY) ?? "[]";
}

function saveNotes(notes: Note[]) {
  window.localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

export default function NotesPage() {
  const router = useRouter();
  const user = useSyncExternalStore(subscribeToStorage, getUserSnapshot, () => "");
  const notesSnapshot = useSyncExternalStore(subscribeToStorage, getNotesSnapshot, () => "[]");
  const notes = useMemo(() => {
    try {
      const storedNotes: unknown = JSON.parse(notesSnapshot);
      return Array.isArray(storedNotes) ? storedNotes as Note[] : [];
    } catch {
      return [];
    }
  }, [notesSnapshot]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!user) router.replace("/");
  }, [router, user]);

  const filteredNotes = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return notes;
    return notes.filter((note) =>
      `${note.title} ${note.body}`.toLocaleLowerCase().includes(normalizedQuery),
    );
  }, [notes, query]);

  // Add a note from the form, then clear the draft for the next thought.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanTitle = title.trim();
    const cleanBody = body.trim();
    if (!cleanTitle && !cleanBody) return;

    saveNotes([
      {
        id: crypto.randomUUID(),
        title: cleanTitle || "Untitled note",
        body: cleanBody,
        createdAt: Date.now(),
      },
      ...notes,
    ]);
    setTitle("");
    setBody("");
  }

  // Remove the active session before returning to the login screen.
  function handleLogout() {
    sessionStorage.removeItem(USER_KEY);
    window.dispatchEvent(new Event(STORAGE_EVENT));
    router.replace("/");
  }

  function handleDelete(noteId: string) {
    saveNotes(notes.filter((note) => note.id !== noteId));
  }

  if (!user) return <main className="notes-loading">Opening your notebook...</main>;

  return (
    <main className="notes-page">
      <header className="notes-header">
        <Link className="brand" href="/notes" aria-label="Papertrail notes">
          <span className="brand-mark" aria-hidden="true">p.</span>
          <span>papertrail</span>
        </Link>
        <div className="header-actions">
          <span className="user-label">{user}</span>
          <button className="text-button" type="button" onClick={handleLogout}>Log out <span aria-hidden="true">↗</span></button>
        </div>
      </header>

      <section className="notes-content">
        <div className="notes-heading">
          <div>
            <span className="notes-date">A PLACE TO RETURN</span>
            <h1>Your notebook</h1>
          </div>
          <span className="note-count">{notes.length} {notes.length === 1 ? "note" : "notes"}</span>
        </div>

        <form className="composer" onSubmit={handleSubmit}>
          <input
            aria-label="Note title"
            placeholder="Give this thought a title..."
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={100}
          />
          <textarea
            aria-label="Note text"
            placeholder="Start writing. No need to get it just right."
            value={body}
            onChange={(event) => setBody(event.target.value)}
            maxLength={2000}
          />
          <div className="composer-bottom">
            <span className="composer-hint">A thought, a list, a passing idea.</span>
            <button className="primary-button add-button" type="submit">Save note <span aria-hidden="true">+</span></button>
          </div>
        </form>

        <div className="notes-list-header">
          <h2>Recent thoughts</h2>
          <label className="search-wrap">
            <input
              className="search-input"
              aria-label="Search notes"
              placeholder="Find a note..."
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>

        <div className="note-list" aria-live="polite">
          {filteredNotes.length === 0 ? (
            <div className="empty-state">
              <strong>{query ? "No notes found." : "A fresh page."}</strong>
              {query ? "Try another search term." : "Write down the first thing on your mind above."}
            </div>
          ) : filteredNotes.map((note) => (
            <article className="note-card" key={note.id}>
              <button
                className="delete-note"
                type="button"
                aria-label={`Delete ${note.title}`}
                onClick={() => handleDelete(note.id)}
              >
                ×
              </button>
              <h3>{note.title}</h3>
              {note.body && <p>{note.body}</p>}
              <time className="note-time" dateTime={new Date(note.createdAt).toISOString()}>
                {new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(note.createdAt)}
              </time>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}