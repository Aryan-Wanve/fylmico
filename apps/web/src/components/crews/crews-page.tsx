"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck, Clock3, Users, Briefcase } from "lucide-react";
import { useWorkspace } from "@/lib/workspace-context";
import { usePrompt } from "@/components/ui/prompt-dialog";
import {
  createConversation,
  inviteMember,
  listCrew,
  removeCrewMember,
  updateCrewProfile
} from "@/services/base-workspace.service";
import { CrewsHeader } from "@/components/crews/crews-header";
import { CrewStatCard } from "@/components/crews/crew-stat-card";
import { CrewsToolbar, type CrewsTab } from "@/components/crews/crews-toolbar";
import { CrewTableColumnHeader } from "@/components/crews/crew-table-column-header";
import { CrewMemberRow } from "@/components/crews/crew-member-row";
import { CrewsEmptyState } from "@/components/crews/crews-empty-state";
import { DepartmentOverviewPanel } from "@/components/crews/department-overview-panel";
import { CrewByRolePanel } from "@/components/crews/crew-by-role-panel";
import { UpcomingBirthdaysPanel } from "@/components/crews/upcoming-birthdays-panel";
import { PendingMembersPanel } from "@/components/crews/pending-members-panel";
import { PaginationFooter } from "@/components/layout/pagination-footer";
import {
  DEPARTMENT_META,
  DEPARTMENT_ORDER,
  ROLE_CATEGORY_ORDER,
  type CrewMember,
  type Department
} from "@/components/crews/crew-data";

export function CrewsPage() {
  const { activeHouse, refreshWorkspace } = useWorkspace();
  const prompt = usePrompt();
  const router = useRouter();

  const [members, setMembers] = useState<CrewMember[]>([]);
  const [activeTab, setActiveTab] = useState<CrewsTab>("all");
  const [department, setDepartment] = useState<Department | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  useEffect(() => {
    let cancelled = false;

    listCrew()
      .then((data) => {
        if (!cancelled) {
          setMembers(data);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          window.alert(
            error instanceof Error ? error.message : "Could not load the crew."
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const counts: Record<CrewsTab, number> = {
    all: members.length,
    available: members.filter((member) => member.status === "available").length,
    "on-set": members.filter((member) => member.status === "on-set").length,
    unavailable: members.filter((member) => member.status === "unavailable")
      .length,
    groups: DEPARTMENT_ORDER.filter((dept) =>
      members.some((member) => member.department === dept)
    ).length
  };

  const tabFiltered = members.filter((member) => {
    if (activeTab === "available") {
      return member.status === "available";
    }
    if (activeTab === "on-set") {
      return member.status === "on-set";
    }
    if (activeTab === "unavailable") {
      return member.status === "unavailable";
    }
    return true;
  });

  const departmentFiltered = tabFiltered.filter(
    (member) => department === "all" || member.department === department
  );

  const searched = departmentFiltered.filter((member) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return true;
    }
    return (
      member.name.toLowerCase().includes(term) ||
      member.jobTitle.toLowerCase().includes(term) ||
      member.department.toLowerCase().includes(term)
    );
  });

  const totalPages = Math.max(1, Math.ceil(searched.length / perPage));
  const safePage = Math.min(page, totalPages);
  const paginated = searched.slice(
    (safePage - 1) * perPage,
    safePage * perPage
  );

  const groupedByDepartment = DEPARTMENT_ORDER.map((dept) => ({
    department: dept,
    members: searched.filter((member) => member.department === dept)
  })).filter((group) => group.members.length > 0);

  function updateFilter<T>(setter: (value: T) => void, value: T) {
    setter(value);
    setPage(1);
  }

  async function handleMessage(member: CrewMember) {
    try {
      await createConversation({ name: member.name });
      await refreshWorkspace();
    } catch (error) {
      if (
        !(error instanceof Error) ||
        !error.message.toLowerCase().includes("already exists")
      ) {
        window.alert(
          error instanceof Error
            ? error.message
            : "Could not start a conversation."
        );
        return;
      }
    }
    router.push("/messages");
  }

  async function handleEditMember(member: CrewMember) {
    const jobTitle = await prompt("Job title", member.jobTitle);
    if (jobTitle === null) {
      return;
    }

    const tagInput = await prompt(
      `Tag (${ROLE_CATEGORY_ORDER.join(", ")}, or Other)`,
      member.roleCategory
    );
    if (tagInput === null) {
      return;
    }

    const matchedTag = [...ROLE_CATEGORY_ORDER, "Other"].find(
      (option) => option.toLowerCase() === tagInput.trim().toLowerCase()
    );
    if (!matchedTag) {
      window.alert(
        `"${tagInput}" isn't a valid tag. Choose one of: ${ROLE_CATEGORY_ORDER.join(", ")}, Other.`
      );
      return;
    }

    const departmentInput = await prompt(
      `Department (${DEPARTMENT_ORDER.join(", ")})`,
      member.department
    );
    if (departmentInput === null) {
      return;
    }

    const matchedDepartment = DEPARTMENT_ORDER.find(
      (option) => option.toLowerCase() === departmentInput.trim().toLowerCase()
    );
    if (!matchedDepartment) {
      window.alert(
        `"${departmentInput}" isn't a valid department. Choose one of: ${DEPARTMENT_ORDER.join(", ")}.`
      );
      return;
    }

    try {
      const updated = await updateCrewProfile(member.id, {
        jobTitle: jobTitle.trim() || member.jobTitle,
        roleCategory: matchedTag as CrewMember["roleCategory"],
        department: matchedDepartment
      });
      setMembers((current) =>
        current.map((entry) => (entry.id === member.id ? updated : entry))
      );
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not update this member."
      );
    }
  }

  async function handleRemove(memberId: string) {
    if (
      !window.confirm(
        "Remove this person from the house? They'll lose access immediately."
      )
    ) {
      return;
    }

    try {
      await removeCrewMember(memberId);
      setMembers((current) =>
        current.filter((member) => member.id !== memberId)
      );
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not remove this member."
      );
    }
  }

  async function handleInvite() {
    const email = await prompt("Invite by email — enter their email address");
    if (!email || !email.trim()) {
      return;
    }

    try {
      const invitation = await inviteMember(email.trim());
      if (invitation.inviteUrl) {
        navigator.clipboard?.writeText(invitation.inviteUrl).catch(() => {});
        await prompt(
          "Invite link copied to clipboard - share it with them:",
          invitation.inviteUrl
        );
      }
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not send this invite."
      );
    }
  }

  const availableToday = members.filter(
    (member) => member.status === "available"
  ).length;
  const onSetToday = members.filter(
    (member) => member.status === "on-set"
  ).length;
  const departmentsWithMembers = DEPARTMENT_ORDER.filter((dept) =>
    members.some((member) => member.department === dept)
  ).length;

  return (
    <div className="grid grid-cols-1 gap-6 p-8">
      <CrewsHeader onInvite={handleInvite} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CrewStatCard
          icon={Users}
          note={`${members.length} across all departments`}
          title="Total Members"
          tone="violet"
          value={String(members.length)}
        />
        <CrewStatCard
          icon={Briefcase}
          note="Active departments"
          title="Departments"
          tone="blue"
          value={String(departmentsWithMembers)}
        />
        <CrewStatCard
          icon={CalendarCheck}
          note={`${Math.round((availableToday / (members.length || 1)) * 100)}% of team`}
          title="Available Today"
          tone="green"
          value={String(availableToday)}
        />
        <CrewStatCard
          icon={Clock3}
          note="Currently shooting"
          title="On Set Today"
          tone="orange"
          value={String(onSetToday)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_20rem]">
        <div className="grid min-w-0 grid-cols-1 content-start gap-4">
          <CrewsToolbar
            activeTab={activeTab}
            counts={counts}
            department={department}
            onDepartmentChange={(value) => updateFilter(setDepartment, value)}
            onSearchChange={(value) => updateFilter(setSearchTerm, value)}
            onTabChange={(tab) => updateFilter(setActiveTab, tab)}
            searchTerm={searchTerm}
          />

          {searched.length === 0 ? (
            <CrewsEmptyState />
          ) : activeTab === "groups" ? (
            <div className="grid gap-4">
              {groupedByDepartment.map((group) => {
                const meta = DEPARTMENT_META[group.department];
                const Icon = meta.icon;

                return (
                  <div
                    className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]"
                    key={group.department}
                  >
                    <div className="flex items-center gap-2 border-b border-black/5 bg-[#fafafd] px-4 py-2.5 dark:border-white/[0.06] dark:bg-[#1b1e2d]">
                      <span
                        className={`grid h-6 w-6 place-items-center rounded-md ${meta.bg} ${meta.color}`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <strong className="text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
                        {group.department} Department
                      </strong>
                      <span className="rounded-full bg-black/[0.06] px-1.5 py-0.5 text-xs font-bold text-[#4b5268] dark:bg-white/[0.08] dark:text-[#c7cad9]">
                        {group.members.length}
                      </span>
                    </div>
                    {group.members.map((member) => (
                      <CrewMemberRow
                        key={member.id}
                        member={member}
                        onEdit={() => handleEditMember(member)}
                        onMessage={() => handleMessage(member)}
                        onRemove={() => handleRemove(member.id)}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          ) : (
            <>
              <div className="min-w-0 overflow-x-auto rounded-2xl border border-black/[0.06] bg-white shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]">
                <div className="min-w-[46rem]">
                  <CrewTableColumnHeader />
                  {paginated.map((member) => (
                    <CrewMemberRow
                      key={member.id}
                      member={member}
                      onEdit={() => handleEditMember(member)}
                      onMessage={() => handleMessage(member)}
                      onRemove={() => handleRemove(member.id)}
                    />
                  ))}
                </div>
              </div>
              <PaginationFooter
                onPageChange={setPage}
                onPerPageChange={(value) => {
                  setPerPage(value);
                  setPage(1);
                }}
                page={safePage}
                perPage={perPage}
                totalPages={totalPages}
              />
            </>
          )}
        </div>

        <aside className="grid min-w-0 grid-cols-1 content-start gap-6">
          {activeHouse ? (
            <PendingMembersPanel
              houseId={activeHouse.id}
              members={activeHouse.pendingMembers}
              onChanged={refreshWorkspace}
            />
          ) : null}
          <DepartmentOverviewPanel members={members} />
          <CrewByRolePanel members={members} />
          <UpcomingBirthdaysPanel members={members} />
        </aside>
      </div>
    </div>
  );
}
