import { Loader2 } from "lucide-react";

import { Suspense, lazy, useEffect, useRef, useState } from "react";

import ErrorNotification from "@/components/base/error";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/base/ui/tabs";

import { PaginationProvider } from "@/context/pagination/provider";

import { useQuery } from "@/context/query/useQuery";

// 按钮集
import DatasetActions from "./components/slot/dataset-actions";

// components
import QueryHistory from "./components/query-history";
import QueryLog from "./components/query-log";

const LazyJSONViewer = lazy(() =>
    import("./components/json-viewer").then((module) => ({
        default: module.JSONViewer,
    })),
);

const LazyChartViewer = lazy(() =>
    import("./components/chart").then((module) => ({
        default: module.ChartContainer,
    })),
);

const LazyTableViewer = lazy(() =>
    import("./components/table").then((module) => ({
        default: module.TableViewer,
    })),
);

function Fallback() {
    return (
        <span className="m-2">
            <Loader2 className="size-5 animate-spin" />
        </span>
    );
}

type ResultView = "table" | "chart" | "json" | "history" | "log" | "error";

const TAB_LABELS = {
    Table: "数据表",
    Chart: "Chart 图表",
    Json: "JSON",
    History: "运行记录",
    Log: "日志",
} as const;

/**
 * Parent container for the results viewer.
 */
export default function ResultsView() {
    const [tab, setTab] = useState<ResultView>("table");
    const [showErrorTab, setShowErrorTab] = useState(false);
    const { meta, status, sql } = useQuery();
    const error = meta?.error;
    const prevErrorRef = useRef(error);
    const prevStatusRef = useRef(status);

    /**
     * @description: 页签逻辑： 查询初始时，切换到日志页签，并隐藏上一次的错误页签，若成功切换到 数据表查看， 若失败 切换到 error 页签查看错误日志
     * @author: M.yunlong
     * @date: 2025-06-12 16:08:39
     */
    useEffect(() => {
        if (status === "RUNNING" && prevStatusRef.current !== "RUNNING") {
            // --
            setTab("log");
            // --
            prevErrorRef.current = null;
            // --
            setShowErrorTab(false);
        } else if (status === "IDLE" && prevStatusRef.current === "RUNNING") {
            if (error) {
                // --
                setShowErrorTab(true);
                // --
                setTab("error");
            } else {
                setTab("table");
            }
        }

        prevStatusRef.current = status;

        prevErrorRef.current = error;
    }, [status, error, sql, tab]);

    return (
        <PaginationProvider>
            <div className="relative size-full max-w-full">
                <Tabs
                    value={tab}
                    onValueChange={(v) => {
                        console.log("Tab manually changed to:", v);
                        setTab(v as ResultView);
                    }}
                    defaultValue="table"
                    className="size-full"
                >
                    <div className="sticky inset-x-0 top-0 z-10 flex w-full justify-between bg-muted">
                        <TabsList>
                            {["Table", "Chart", "Json", "History", "Log"].map(
                                (value) => (
                                    <TabsTrigger
                                        key={value}
                                        value={value.toLowerCase()}
                                        className="text-xs"
                                    >
                                        {
                                            TAB_LABELS[
                                                value as keyof typeof TAB_LABELS
                                            ]
                                        }
                                    </TabsTrigger>
                                ),
                            )}
                            {showErrorTab && (
                                <TabsTrigger value="error">
                                    <span className="text-xs text-red-500">
                                        Error
                                    </span>
                                </TabsTrigger>
                            )}
                        </TabsList>
                        <div className="inline-flex items-center gap-1">
                            {tab === "history" && <DatasetActions />}
                        </div>
                    </div>
                    <TabsContent
                        value="table"
                        className="h-[calc(100%-50px)] flex-col border-none p-0 px-2 data-[state=active]:flex"
                    >
                        <Suspense fallback={<Fallback />}>
                            <LazyTableViewer />
                        </Suspense>
                    </TabsContent>
                    <TabsContent
                        value="chart"
                        className="h-[calc(100%-50px)] flex-col border-none p-0 px-2 data-[state=active]:flex"
                    >
                        <Suspense fallback={<Fallback />}>
                            <LazyChartViewer />
                        </Suspense>
                    </TabsContent>
                    <TabsContent
                        value="json"
                        className="h-[calc(100%-50px)] flex-col border-none p-0 px-2 data-[state=active]:flex"
                    >
                        <Suspense fallback={<Fallback />}>
                            <LazyJSONViewer />
                        </Suspense>
                    </TabsContent>
                    <TabsContent
                        value="history"
                        className="h-[calc(100%-50px)] flex-col border-none p-0 px-2 data-[state=active]:flex"
                    >
                        <QueryHistory />
                    </TabsContent>
                    <TabsContent
                        value="log"
                        className="h-[calc(100%-50px)] flex-col border-none p-0 px-2 data-[state=active]:flex"
                    >
                        <QueryLog />
                    </TabsContent>
                    {showErrorTab && (
                        <TabsContent
                            value="error"
                            className="h-[calc(100%-50px)] flex-col border-none p-0 px-2 data-[state=active]:flex"
                        >
                            <div className="w-full px-4 py-4">
                                <div className="mx-auto w-full">
                                    <ErrorNotification
                                        error={error ?? "Unknown error"}
                                    />
                                </div>
                            </div>
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </PaginationProvider>
    );
}
