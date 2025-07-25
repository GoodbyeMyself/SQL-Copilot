import { motion } from "framer-motion";

import { get } from "idb-keyval";

import { ChevronRight, CopyCheck } from "lucide-react";

import { useEffect, useState } from "react";

import { z } from "zod";

import { Button, Modal, Tag, App } from "antd";

import { IDB_KEYS } from "@/constants.client";

import { useQuery } from "@/context/query/useQuery";

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

import { cn } from "@/lib/utils";

import { queryMetaSchema, type QueryMeta } from "@/types/query";

import EmptyResults from "./slot/empty";
/**
 * Note: idb-keyval is probably the wrong tool for anything more advanced than this.
 * Would be better to avoid keyval and use a proper indexeddb schema.
 */

const onGetStoredQueries = async (): Promise<QueryMeta[]> => {
    // get stored queries from indexeddb
    const stored = await get(IDB_KEYS.QUERY_HISTORY);

    if (!stored) return [];

    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            const validated = z.array(queryMetaSchema).safeParse(parsed);
            if (validated.success) {
                return validated.data;
            }
        } catch (e) {
            console.error("Failed to parse query history", e);
        }
    }
    return [];
};

function RunHoverCard(props: QueryMeta) {
    // 使用 App.useApp() 获取 message 方法
    const { message } = App.useApp();
    
    const { isCopied, copyToClipboard } = useCopyToClipboard({
        timeout: 1500,
    });
    const { hash, sql, cacheHit, executionTime, error, status } = props;
    const [isModalOpen, setIsModalOpen] = useState(false);

    const formatter = new Intl.NumberFormat("en-UK", {
        maximumFractionDigits: 2,
        compactDisplay: "short",
    });

    const duration = formatter.format(executionTime / 1000);

    const handleCopySql = () => {
        copyToClipboard(sql);
        message.success(isCopied ? "已复制" : "复制成功");
    };

    return (
        <>
            <motion.li
                layout
                key={hash}
                className={cn(
                    "relative mb-2 flex cursor-pointer items-center space-x-4 rounded-md bg-gray-100 px-2 py-4 transition-colors",
                    error && "bg-yellow-200",
                )}
                onClick={() => setIsModalOpen(true)}
            >
                <div className="min-w-0 flex-auto">
                    <div className="flex items-center gap-x-3">
                        <div
                            className={cn(
                                "flex-none rounded-full p-1",
                                status === "SUCCESS" && "bg-green-500",
                                status === "ERROR" && "bg-yellow-500",
                            )}
                        >
                            <div className="size-2 rounded-full bg-current" />
                        </div>
                        <h2 className="min-w-0 text-sm font-semibold leading-6 running-status-title">
                            <span className="truncate">
                                {error ? "Error" : "Success"}
                            </span>
                            <span className="px-1 text-gray-400"> / </span>
                            <span className="whitespace-nowrap">
                                {duration}s
                            </span>
                            <span className="absolute inset-0" />
                        </h2>
                        <Tag
                            color={cacheHit ? "green" : "blue"}
                        >
                            {/* "live" 表示这是一个实时查询的结果，而不是从缓存中获取的结果。
                             当查询是实时执行时，会显示绿色的样式；当查询结果来自缓存时，会显示橙色的样式。 */}
                            {cacheHit ? "CACHE" : "LIVE"}
                        </Tag>
                    </div>
                    {error && (
                        <div className="mt-3 flex items-center gap-x-2.5 text-xs leading-5 text-gray-400">
                            <span className="line-clamp-3 truncate text-wrap break-words text-left font-mono text-xs text-gray-700">
                                {error}
                            </span>
                        </div>
                    )}
                    <div className="mt-3 flex items-center gap-x-2.5 text-xs leading-5 text-gray-400">
                        <span className="line-clamp-3 truncate text-wrap break-words text-left font-mono text-xs text-gray-700">
                            {sql}
                        </span>
                        {isCopied && (
                            <div className="absolute inset-y-1 right-1">
                                <CopyCheck
                                    className="bg-transparent text-green-700"
                                    size={18}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <ChevronRight
                    className="size-5 flex-none text-gray-400"
                    aria-hidden="true"
                />
            </motion.li>

            <Modal
                title="查询详情"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                width={800}
                footer={[
                    <Button key="close" onClick={() => setIsModalOpen(false)}>
                        关闭
                    </Button>,
                    <Button key="copy" type="primary" onClick={handleCopySql}>
                        {isCopied ? "已复制" : "复制 SQL"}
                    </Button>,
                ]}
            >
                <div className="space-y-4">
                    {error && (
                        <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-3 shadow-sm transition-all">
                            <h3 className="text-sm font-semibold text-red-700">
                                错误信息
                            </h3>
                            <pre className="whitespace-pre-wrap rounded-md bg-white p-3 text-sm text-red-600 shadow-inner">
                                {error}
                            </pre>
                        </div>
                    )}
                    <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-3 shadow-sm transition-all">
                        <h3 className="text-sm font-semibold text-gray-700">
                            SQL 语句
                        </h3>
                        <pre className="whitespace-pre-wrap rounded-md bg-white p-3 text-sm text-gray-600 shadow-inner">
                            {sql}
                        </pre>
                    </div>
                </div>
            </Modal>
        </>
    );
}

export default function QueryHistory() {
    const [runs, setRuns] = useState<QueryMeta[]>([]);
    const { meta } = useQuery();
    const uniqueId = `${meta?.hash}_${meta?.created}`;

    useEffect(() => {
        let ignore = false;

        const refresh = async () => {
            const stored = await onGetStoredQueries();
            if (ignore) return;
            setRuns(stored);
        };

        refresh();

        // 监听清空历史记录事件
        const handleHistoryCleared = () => {
            if (!ignore) {
                setRuns([]);
            }
        };

        window.addEventListener('queryHistoryCleared', handleHistoryCleared);

        return () => {
            ignore = true;
            window.removeEventListener('queryHistoryCleared', handleHistoryCleared);
        };
    }, [uniqueId]);

    if (runs.length === 0) {
        return (
            <div className="flex h-full max-h-full flex-1 flex-col justify-between gap-4 overflow-y-auto px-2 py-4 pb-20">
                <EmptyResults text="暂无运行记录" />
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100%-12px)] flex-col">
            <div className="flex-1 overflow-hidden">
                <motion.div
                    className="flex h-full w-full flex-col gap-1 divide-y divide-white/5 overflow-y-auto px-4 py-1 pr-2 transition-all"
                    role="list"
                >
                    {runs.map((run) => {
                        const key = `${run.hash}_${run.created}`;
                        return (
                            <RunHoverCard
                                key={key}
                                {...run}
                            />
                        );
                    })}
                </motion.div>
            </div>
        </div>
    );
}
