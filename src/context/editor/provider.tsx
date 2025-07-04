import { useEffect, useMemo, useRef } from "react";

import type { EditorForwardedRef } from "@/components/base/monaco";

import { EditorContext } from "./context";

type EditorProviderProps = { children: React.ReactNode };

// Breakup everything into smaller files because of React Fast Refresh limitations.

/**
 * Context provider for monaco editor instance.
 */
function EditorProvider(props: EditorProviderProps) {
    const editorRef = useRef<EditorForwardedRef | null>(null);

    // cleanup
    useEffect(() => {
        const editor = editorRef.current?.getEditor();
        return () => {
            editor?.dispose();
        };
    }, []);

    const value = useMemo(
        () => ({
            editorRef,
        }),
        [],
    );
    return (
        <EditorContext.Provider value={value}>
            {props.children}
        </EditorContext.Provider>
    );
}

export { EditorProvider };
