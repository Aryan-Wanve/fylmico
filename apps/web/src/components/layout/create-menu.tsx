"use client";

import { useRouter } from "next/navigation";
import { ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useWorkspace } from "@/lib/workspace-context";
import { usePrompt } from "@/components/ui/prompt-dialog";
import {
  createConversation,
  createProject,
  createTask
} from "@/services/base-workspace.service";

export function CreateMenu() {
  const router = useRouter();
  const { workspace, refreshWorkspace } = useWorkspace();
  const prompt = usePrompt();

  async function handleNewProject() {
    const title = await prompt("Name your new project");
    if (!title || !title.trim()) {
      return;
    }

    try {
      await createProject({
        name: title.trim(),
        description: "A new production ready to move into pre-production.",
        stage: "Development",
        coverGradient: "from-slate-400 via-slate-600 to-slate-800"
      });
      router.push("/projects");
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not create the project."
      );
    }
  }

  async function handleNewTask() {
    const title = await prompt("Task title");
    if (!title || !title.trim()) {
      return;
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    try {
      await createTask({
        title: title.trim(),
        assignees: [{ userId: workspace.user.id }],
        dueDate: dueDate.toISOString(),
        priority: "medium",
        status: "todo"
      });
      await refreshWorkspace();
      router.push("/tasks");
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not create the task."
      );
    }
  }

  async function handleNewChatRoom() {
    const name = await prompt("Start a new channel — enter a name");
    if (!name || !name.trim()) {
      return;
    }

    try {
      await createConversation({ name: name.trim() });
      await refreshWorkspace();
      router.push("/messages");
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not create the channel."
      );
    }
  }

  const createOptions = [
    { label: "New project", onSelect: handleNewProject },
    { label: "New task", onSelect: handleNewTask },
    { label: "New chat room", onSelect: handleNewChatRoom }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            className="h-10 gap-1.5 rounded-xl bg-gradient-to-br from-[#654cff] to-[#5b3ff0] px-4 font-bold text-white hover:opacity-95"
            type="button"
          >
            <Plus className="h-4 w-4" />
            Create
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {createOptions.map((option) => (
          <DropdownMenuItem key={option.label} onClick={option.onSelect}>
            <span className="font-semibold text-[#12142b] dark:text-[#f1f2f8]">
              {option.label}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
