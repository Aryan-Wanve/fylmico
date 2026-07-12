import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type ChatTab = "messages" | "files" | "tasks" | "events";

export function ChatTabs({
  activeTab,
  onTabChange
}: {
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
        <TabsTrigger value="tasks">Tasks</TabsTrigger>
        <TabsTrigger value="events">Events</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
