import * as React from "react";

// https://github.com/shadcn-ui/ui/blob/main/apps/www/hooks/use-mutation-observer.ts
export const useMutationObserver = (
    ref: React.MutableRefObject<HTMLElement | null>,
    callback: MutationCallback,
    options = {
        attributes: true,
        characterData: true,
        childList: true,
        subtree: true,
    },
) => {
    React.useEffect(() => {
        if (ref.current) {
            const observer = new MutationObserver(callback);
            observer.observe(ref.current, options);
            return () => observer.disconnect();
        }
    }, [ref, callback, options]);
};
