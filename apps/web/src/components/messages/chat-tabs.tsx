import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Channel } from "@/components/messages/message-data";

export type ChatTab = "messages" | "files" | "tasks" | "events";

export function ChatTabs({
  channel,
  activeTab,
  onTabChange
}: {
  channel: Channel;
  activeTab: ChatTab;
  onTabChange: (tab: ChatTab) => void;
}) {
  return (
    <Tabs
      onValueChange={(value) => onTabChange(value as ChatTab)}
      value={activeTab}
    >
      <TabsList variant="line">
        <TabsTrigger value="messages">Messages</TabsTrigger>
        <TabsTrigger value="files">Files</TabsTrigger>
        <TabsTrigger className="group" value="tasks">
          Tasks
          {channel.tasks.length > 0 ? (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-black/[0.06] px-1 text-xs font-bold text-[#4b5268] group-data-active:bg-[#654cff]/10 group-data-active:text-[#654cff]">
              {channel.tasks.length}
            </span>
          ) : null}
        </TabsTrigger>
        <TabsTrigger value="events">Events</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
