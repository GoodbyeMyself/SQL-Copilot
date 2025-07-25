import { Alert } from "antd";

import { motion } from "framer-motion";

import { AlertOctagon, ChevronDown } from "lucide-react";

import { useState } from "react";

import { useQuery } from "@/context/query/useQuery";

import { cn } from "@/lib/utils";

import { ScrollArea } from "./ui/scroll-area";

const prettify = (str: string) => {
    try {
        // remove newlines
        let pretty = str.replaceAll(/\n/g, "");

        pretty = JSON.stringify(JSON.parse(pretty), null, "\t");

        return pretty;
    } catch (e) {
        return str;
    }
};

export default function ErrorNotification(props: { error: string }) {
    const [isOpen, setIsOpen] = useState(false);

    const { meta } = useQuery();

    const error = prettify(props.error);

    return (
        <Alert
            type="error"
            message={
                <div className="flex flex-col gap-3">
                    <div className="inline-flex items-center gap-2">
                        <AlertOctagon className="size-4" />
                        <p className="text-base">Error</p>
                    </div>
                    
                    <ScrollArea className="flex h-full max-h-72 flex-col gap-4 overflow-y-auto">
                        <div className="whitespace-pre-wrap py-2 font-mono text-sm">
                            {error}
                        </div>

                        <div className="py-3">
                            <button
                                type="button"
                                onClick={() => setIsOpen(!isOpen)}
                                className="flex items-center gap-1 text-xs font-semibold"
                            >
                                <span>Details</span>
                                <ChevronDown
                                    className={cn("size-4", isOpen ? "rotate-180" : "rotate-0")}
                                />
                            </button>
                        </div>

                        {isOpen && (
                            <motion.div className="flex flex-col gap-2">
                                {Object.entries(meta ?? {}).map(([key, value]) => (
                                    <div
                                        key={key}
                                        className="flex flex-col gap-1"
                                    >
                                        <span className="text-xs font-semibold opacity-60">{key}</span>
                                        <span className="whitespace-pre font-mono text-sm">
                                            {typeof value === "string"
                                                ? prettify(value)
                                                : JSON.stringify(value, null, 2)}
                                        </span>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </ScrollArea>
                </div>
            }
            className={cn(
                "group flex flex-col gap-3 hover:shadow",
                "space-y-1 font-mono transition-transform",
            )}
        />
    );
}
