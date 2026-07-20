"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ClientItem, CreateClientRequest } from "@/types/base";

export function ClientEditDialog({
  open,
  onOpenChange,
  client,
  onSave
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: ClientItem | null;
  onSave: (request: CreateClientRequest) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [gst, setGst] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- prefilling the form for the client being edited (or blanking it for a new one) each time the dialog opens, not deriving render output
    setName(client?.name ?? "");
    setLogoUrl(client?.logoUrl ?? "");
    setContactName(client?.contactName ?? "");
    setContactEmail(client?.contactEmail ?? "");
    setPhone(client?.phone ?? "");
    setAddress(client?.address ?? "");
    setGst(client?.gst ?? "");
    setNotes(client?.notes ?? "");
    setError("");
  }, [open, client]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Give the client a company name.");
      return;
    }

    setError("");
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        logoUrl: logoUrl.trim() || undefined,
        contactName: contactName.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        gst: gst.trim() || undefined,
        notes: notes.trim() || undefined
      });
      onOpenChange(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not save the client."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-xl">
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{client ? "Edit Client" : "New Client"}</DialogTitle>
          </DialogHeader>

          <label className="grid gap-1.5">
            <Label>Company Name</Label>
            <Input
              autoFocus
              onChange={(event) => setName(event.target.value)}
              value={name}
            />
          </label>

          <label className="grid gap-1.5">
            <Label>Logo URL</Label>
            <Input
              onChange={(event) => setLogoUrl(event.target.value)}
              value={logoUrl}
            />
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <Label>Contact Person</Label>
              <Input
                onChange={(event) => setContactName(event.target.value)}
                value={contactName}
              />
            </label>
            <label className="grid gap-1.5">
              <Label>Phone</Label>
              <Input
                onChange={(event) => setPhone(event.target.value)}
                value={phone}
              />
            </label>
            <label className="grid gap-1.5">
              <Label>Email</Label>
              <Input
                onChange={(event) => setContactEmail(event.target.value)}
                type="email"
                value={contactEmail}
              />
            </label>
            <label className="grid gap-1.5">
              <Label>GST (optional)</Label>
              <Input
                onChange={(event) => setGst(event.target.value)}
                value={gst}
              />
            </label>
          </div>

          <label className="grid gap-1.5">
            <Label>Address</Label>
            <Input
              onChange={(event) => setAddress(event.target.value)}
              value={address}
            />
          </label>

          <label className="grid gap-1.5">
            <Label>Notes</Label>
            <Input
              onChange={(event) => setNotes(event.target.value)}
              value={notes}
            />
          </label>

          {error ? (
            <p className="animate-in fade-in slide-in-from-top-1 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-semibold text-red-600 duration-200">
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={saving} type="submit">
              {saving ? "Saving..." : client ? "Save Changes" : "Create Client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
