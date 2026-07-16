"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { ClientCard } from "@/components/projects/client-card";
import { ClientEditDialog } from "@/components/projects/client-edit-dialog";
import {
  archiveClient,
  createClient,
  deleteClient,
  listClients,
  updateClient
} from "@/services/base-workspace.service";
import type { ClientItem, CreateClientRequest } from "@/types/base";

export function ClientsPage() {
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientItem | null>(null);

  useEffect(() => {
    void refresh();
  }, []);

  async function refresh() {
    try {
      setClients(await listClients());
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not load clients."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(request: CreateClientRequest) {
    if (editingClient) {
      await updateClient(editingClient.id, request);
    } else {
      await createClient(request);
    }
    await refresh();
  }

  async function handleArchive(clientId: string) {
    try {
      await archiveClient(clientId);
      setClients((current) => current.filter((c) => c.id !== clientId));
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not archive the client."
      );
    }
  }

  async function handleDelete(clientId: string) {
    if (!window.confirm("Delete this client? This cannot be undone.")) {
      return;
    }
    try {
      await deleteClient(clientId);
      setClients((current) => current.filter((c) => c.id !== clientId));
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not delete the client."
      );
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 p-8">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Link
            className="flex items-center gap-1.5 text-sm font-semibold text-[#654cff]"
            href="/projects"
          >
            <ArrowLeft className="h-4 w-4" />
            Projects
          </Link>
          <h1 className="mt-1 text-2xl font-black text-[#11142c] sm:text-3xl dark:text-[#f1f2f8]">
            Clients
          </h1>
          <p className="mt-1 text-sm text-[#5f667d] sm:text-base dark:text-[#a8acbf]">
            Manage the companies you produce work for.
          </p>
        </div>
        <button
          className="flex h-10 shrink-0 items-center gap-2 rounded-xl bg-[#654cff] px-4 text-sm font-bold text-white hover:bg-[#5a41ea]"
          onClick={() => {
            setEditingClient(null);
            setDialogOpen(true);
          }}
          type="button"
        >
          <Plus className="h-4 w-4" />
          New Client
        </button>
      </div>

      {!loading && clients.length === 0 ? (
        <div className="grid place-items-center gap-2 rounded-2xl border border-black/[0.06] bg-white p-16 text-center dark:border-white/[0.08] dark:bg-[#171a28]">
          <p className="text-sm text-[#8a90a3] dark:text-[#7d8299]">
            No clients yet. Add one to start organizing projects under it.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {clients.map((client) => (
            <ClientCard
              client={client}
              key={client.id}
              onArchive={() => handleArchive(client.id)}
              onDelete={() => handleDelete(client.id)}
              onEdit={() => {
                setEditingClient(client);
                setDialogOpen(true);
              }}
            />
          ))}
        </div>
      )}

      <ClientEditDialog
        client={editingClient}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        open={dialogOpen}
      />
    </div>
  );
}
