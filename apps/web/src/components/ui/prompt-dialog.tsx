"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode
} from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type PromptFn = (
  message: string,
  defaultValue?: string
) => Promise<string | null>;

const PromptDialogContext = createContext<PromptFn | null>(null);

// Drop-in replacement for window.prompt() with the same call signature and
// resolve semantics (null on cancel, the trimmed string on submit) - a
// styled, dark-mode-aware dialog instead of an unstylable native popup.
export function usePrompt(): PromptFn {
  const ctx = useContext(PromptDialogContext);
  if (!ctx) {
    throw new Error("usePrompt must be used within a PromptDialogProvider");
  }
  return ctx;
}

interface PromptState {
  message: string;
  value: string;
  resolve: (value: string | null) => void;
}

export function PromptDialogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PromptState | null>(null);

  const prompt = useCallback<PromptFn>((message, defaultValue = "") => {
    return new Promise((resolve) => {
      setState({ message, value: defaultValue, resolve });
    });
  }, []);

  function close(result: string | null) {
    setState((current) => {
      current?.resolve(result);
      return null;
    });
  }

  return (
    <PromptDialogContext.Provider value={prompt}>
      {children}
      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            close(null);
          }
        }}
        open={state !== null}
      >
        <DialogContent>
          {state ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                close(state.value.trim() || null);
              }}
            >
              <DialogHeader>
                <DialogTitle>{state.message}</DialogTitle>
              </DialogHeader>
              <Input
                autoFocus
                className="mt-4 h-11 rounded-lg border-black/10 px-3.5 text-sm dark:border-white/10 dark:bg-[#11142c]"
                onChange={(event) =>
                  setState((current) =>
                    current
                      ? { ...current, value: event.target.value }
                      : current
                  )
                }
                onFocus={(event) => event.target.select()}
                value={state.value}
              />
              <DialogFooter className="mt-5">
                <Button
                  className="h-9 rounded-lg border-black/10 px-4 text-sm font-bold text-[#4b5268] hover:bg-black/[0.03] dark:border-white/10 dark:text-[#c7cad9] dark:hover:bg-white/[0.05]"
                  onClick={() => close(null)}
                  type="button"
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  className="h-9 rounded-lg bg-[var(--fylmico-accent)] px-4 text-sm font-bold text-white hover:bg-[var(--fylmico-accent-strong)]"
                  type="submit"
                >
                  Continue
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </PromptDialogContext.Provider>
  );
}
