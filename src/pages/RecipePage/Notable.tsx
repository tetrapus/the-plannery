import React, { useContext, useState } from "react";
import { Flex } from "../../components/atoms/Flex";
import { Stack } from "components/atoms/Stack";
import { TextInput } from "components/atoms/TextInput";
import firebase from "firebase";
import { AnimatedIconButton } from "components/atoms/AnimatedIconButton";
import edit from "animations/edit.json";
import trash from "animations/trash.json";
import { AuthStateContext } from "data/auth-state";
import ReactTimeago from "react-timeago";
import { Breakpoint } from "components/styles/Breakpoint";
import { Darkmode } from "components/styles/Darkmode";

interface Edit {
  value: string;
  authors: string[];
}

interface Note {
  value: string;
  author: string;
  added: firebase.firestore.Timestamp;
}

interface NoteState {
  users?: firebase.User[];
  notes: {
    [id: string]: {
      [key: string]: Note[];
    } & { ref: firebase.firestore.DocumentReference };
  };
  edits: Edit[];
}

export const NotableContext = React.createContext<NoteState | undefined>(
  undefined
);

function NoteContent({
  note,
  editing,
  onDelete,
}: {
  note: Note;
  editing: boolean;
  onDelete: () => void;
}) {
  return (
    <>
      <div css={{ overflowWrap: "anywhere", margin: 8, marginBottom: 12 }}>
        {note.value}
      </div>
      <div
        css={{
          position: "absolute",
          bottom: 0,
          right: 0,
          fontSize: 11,
          color: "#888",
          margin: "2px 4px",
        }}
      >
        <ReactTimeago date={note.added.toDate()}></ReactTimeago>
      </div>
      {editing ? (
        <AnimatedIconButton
          css={{ position: "absolute", right: -12, top: -12 }}
          animation={trash}
          iconSize={24}
          floating
          onClick={() => onDelete()}
          onMouseDown={(e: MouseEvent) => e.preventDefault()}
        />
      ) : null}
    </>
  );
}

function NoteContainer({
  user,
  children,
}: {
  user: firebase.User | undefined;
  children: React.ReactNode;
}) {
  return (
    <Flex
      css={{
        background: "#eee",
        borderRadius: 8,
        margin: 4,
        padding: 2,
        position: "relative",
        marginLeft: "30%",
        [Breakpoint.TABLET]: {
          marginLeft: 4,
        },
        [Darkmode]: {
          background: "#333",
        },
      }}
    >
      {user && user.photoURL && (
        <img
          src={user.photoURL}
          css={{
            width: 24,
            height: 24,
            borderRadius: 12,
            margin: 8,
          }}
          alt=""
        />
      )}
      {children}
    </Flex>
  );
}

interface NotableProps {
  slug: string;
  field: string[];
  value: string;
  children: (value: string) => React.ReactNode;
}

export function Notable({ slug, field, value, children }: NotableProps) {
  const context = useContext(NotableContext);
  const { currentUser } = useContext(AuthStateContext);
  const [editing, setEditing] = useState<boolean>(false);
  const [editedValue, setEditedValue] = useState<Edit | undefined>(undefined);
  const [currentNote, setCurrentNote] = useState<Note | undefined>();

  if (!context || !currentUser) {
    return <>{children(value)}</>;
  }

  const savedNotes = context.notes?.[slug]?.[field.join(".")] || [];
  console.log(savedNotes);
  const currentValue = editedValue ? editedValue.value : value;

  const addNote = () => {
    setCurrentNote({
      value: "",
      author: currentUser.uid,
      added: firebase.firestore.Timestamp.now(),
    });
  };

  const enableEditing = () => {
    setEditing(true);
    addNote();
  };

  return (
    <Stack
      onDoubleClick={() => enableEditing()}
      css={{
        position: "relative",
        ":hover .hoverbutton": { display: "inline-block" },
      }}
    >
      {children(currentValue)}
      {editing
        ? null && (
            <textarea
              onChange={(e) => {
                const value = e.target.value;
                setEditedValue((edit) => {
                  console.log(e);
                  return {
                    ...(edit || { authors: [currentUser.uid] }),
                    value,
                  };
                });
              }}
              css={{
                position: "absolute",
                width: "100%",
                height: "calc(100% - 22px)",
                top: 10,
                left: -6,
                fontFamily: "inherit",
                fontSize: "inherit",
                padding: 6,
                background: "#eee",
                border: "none",
                outline: "none",
              }}
              value={currentValue}
            ></textarea>
          )
        : null}
      {savedNotes.map((note, idx) => (
        <NoteContainer
          key={idx}
          user={context?.users?.find((user) => user.uid === note.author)}
        >
          <NoteContent
            note={note}
            editing={editing}
            onDelete={() =>
              context.notes[slug].ref.set(
                {
                  [field.join(".")]:
                    firebase.firestore.FieldValue.arrayRemove(note),
                },
                { merge: true }
              )
            }
          />
        </NoteContainer>
      ))}
      {currentNote && (
        <NoteContainer
          user={context?.users?.find((user) => user.uid === currentNote.author)}
        >
          <TextInput
            autoFocus
            css={{ flexGrow: 1, background: "none", margin: 0 }}
            value={currentNote.value}
            onKeyPress={async (e) => {
              if (e.key === "Enter") {
                if (e.currentTarget.value === "") {
                  setCurrentNote(undefined);
                  setEditing(false);
                } else {
                  await context.notes[slug].ref.set(
                    {
                      [field.join(".")]:
                        firebase.firestore.FieldValue.arrayUnion(currentNote),
                    },
                    { merge: true }
                  );
                  addNote();
                }
              }
            }}
            onBlur={(e) => {
              if (e.currentTarget.value === "") {
                setCurrentNote(undefined);
                setEditing(false);
              }
            }}
            onChange={(e) =>
              setCurrentNote(
                currentNote
                  ? { ...currentNote, value: e.target.value }
                  : undefined
              )
            }
          />
        </NoteContainer>
      )}
      {!editing ? (
        <AnimatedIconButton
          onClick={() => enableEditing()}
          animation={edit}
          floating
          iconSize={32}
          className="hoverbutton"
          css={{
            display: "none",
            position: "absolute",
            bottom: -8,
            right: -16,
          }}
        ></AnimatedIconButton>
      ) : null}
    </Stack>
  );
}
