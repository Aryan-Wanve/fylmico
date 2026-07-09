"use client";

import { useState } from "react";
import { CalendarCheck, Clock3, Users, Briefcase } from "lucide-react";
import { CrewsHeader } from "@/components/crews/crews-header";
import { CrewStatCard } from "@/components/crews/crew-stat-card";
import { CrewsToolbar, type CrewsTab } from "@/components/crews/crews-toolbar";
import { CrewTableColumnHeader } from "@/components/crews/crew-table-column-header";
import { CrewMemberRow } from "@/components/crews/crew-member-row";
import { CrewsEmptyState } from "@/components/crews/crews-empty-state";
import { DepartmentOverviewPanel } from "@/components/crews/department-overview-panel";
import { CrewByRolePanel } from "@/components/crews/crew-by-role-panel";
import { UpcomingBirthdaysPanel } from "@/components/crews/upcoming-birthdays-panel";
import { PaginationFooter } from "@/components/layout/pagination-footer";
import {
  DEPARTMENT_META,
  DEPARTMENT_ORDER,
  crewMembers as defaultMembers,
  type CrewMember,
  type Department
} from "@/components/crews/crew-data";

export function CrewsPage() {
  const [members, setMembers] = useState<CrewMember[]>(defaultMembers);
  const [activeTab, setActiveTab] = useState<CrewsTab>("all");
  const [department, setDepartment] = useState<Department | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

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

  function handleRemove(memberId: string) {
    setMembers((current) => current.filter((member) => member.id !== memberId));
  }

  function handleInvite() {
    const name = window.prompt("Invite member — enter their name");

    if (!name || !name.trim()) {
      return;
    }

    const member: CrewMember = {
      id: `crew-${Date.now()}`,
      name: name.trim(),
      email: `${name.trim().toLowerCase().replaceAll(" ", ".")}@example.com`,
      jobTitle: "Production Assistant",
      department: "Production",
      roleCategory: "Production Assistant",
      status: "available",
      availability: "TBD"
    };

    setMembers((current) => [member, ...current]);
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
    <div className="grid gap-6 p-8">
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

      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <div className="grid min-w-0 content-start gap-4">
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
                    className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_1rem_3rem_rgba(53,45,124,0.05)]"
                    key={group.department}
                  >
                    <div className="flex items-center gap-2 border-b border-black/5 bg-[#fafafd] px-4 py-2.5">
                      <span
                        className={`grid h-6 w-6 place-items-center rounded-md ${meta.bg} ${meta.color}`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <strong className="text-sm font-bold text-[#11142c]">
                        {group.department} Department
                      </strong>
                      <span className="rounded-full bg-black/[0.06] px-1.5 py-0.5 text-xs font-bold text-[#4b5268]">
                        {group.members.length}
                      </span>
                    </div>
                    {group.members.map((member) => (
                      <CrewMemberRow
                        key={member.id}
                        member={member}
                        onRemove={() => handleRemove(member.id)}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          ) : (
            <>
              <div className="min-w-0 overflow-x-auto rounded-2xl border border-black/[0.06] bg-white shadow-[0_1rem_3rem_rgba(53,45,124,0.05)]">
                <div className="min-w-[46rem]">
                  <CrewTableColumnHeader />
                  {paginated.map((member) => (
                    <CrewMemberRow
                      key={member.id}
                      member={member}
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

        <aside className="grid min-w-0 content-start gap-6">
          <DepartmentOverviewPanel members={members} />
          <CrewByRolePanel members={members} />
          <UpcomingBirthdaysPanel members={members} />
        </aside>
      </div>
    </div>
  );
}
