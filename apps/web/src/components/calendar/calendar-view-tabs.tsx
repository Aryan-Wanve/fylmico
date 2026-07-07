import { TabsList, TabsTrigger } from "@/components/ui/tabs";

export function CalendarViewTabs() {
  return (
    <TabsList variant="default">
      <TabsTrigger value="month">Month</TabsTrigger>
      <TabsTrigger value="week">Week</TabsTrigger>
      <TabsTrigger value="day">Day</TabsTrigger>
    </TabsList>
  );
}
