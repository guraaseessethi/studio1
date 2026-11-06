import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";
import { CalendarIcon } from "@sanity/icons/Calendar";
import { CogIcon } from "@sanity/icons/Cog";
import { ControlsIcon } from "@sanity/icons/Controls";
import { ImagesIcon } from "@sanity/icons/Images";
import { LockIcon } from "@sanity/icons/Lock";
import { StarIcon } from "@sanity/icons/Star";
import { TagIcon } from "@sanity/icons/Tag";
import { UsersIcon } from "@sanity/icons/Users";
import type { StructureResolver } from "sanity/structure";
import { todayInShop } from "./lib/format";
import { SINGLETON_IDS } from "./schemaTypes";

const BY_TIME = [
  { field: "date", direction: "asc" as const },
  { field: "startTime", direction: "asc" as const },
];

export const structure: StructureResolver = (S, context) => {
  const today = todayInShop();
  const bookings = (title: string, id: string, filter: string, desc = false) =>
    S.listItem()
      .id(id)
      .title(title)
      .child(
        S.documentList()
          .id(id)
          .title(title)
          .schemaType("booking")
          .filter(`_type == "booking" && ${filter}`)
          .params({ today })
          .defaultOrdering(desc ? BY_TIME.map((o) => ({ ...o, direction: "desc" as const })) : BY_TIME),
      );

  return S.list()
    .title("Studio 1")
    .items([
      S.listItem()
        .title("Bookings")
        .icon(CalendarIcon)
        .child(
          S.list()
            .title("Bookings")
            .items([
              bookings("Today", "bookings-today", `date == $today && status in ["new","confirmed"]`),
              bookings("Upcoming", "bookings-upcoming", `date >= $today && status in ["new","confirmed"]`),
              bookings("New (needs confirming)", "bookings-new", `status == "new"`),
              bookings("Awaiting e-Transfer", "bookings-etransfer", `paymentStatus == "awaiting-etransfer" && status in ["new","confirmed"]`),
              bookings("Past", "bookings-past", `date < $today`, true),
              bookings("All bookings", "bookings-all", `true`),
            ]),
        ),
      orderableDocumentListDeskItem({ type: "barber", title: "Barbers", icon: UsersIcon, S, context }),
      S.listItem()
        .title("Services")
        .icon(TagIcon)
        .child(S.documentTypeList("service").title("Services").defaultOrdering([{ field: "group", direction: "asc" }, { field: "order", direction: "asc" }])),
      S.listItem()
        .title("Gallery")
        .icon(ImagesIcon)
        .child(S.document().schemaType("gallery").documentId(SINGLETON_IDS.gallery).title("Gallery")),
      S.listItem().title("Reviews").icon(StarIcon).child(S.documentTypeList("review").title("Reviews")),
      S.listItem()
        .title("Picker chips")
        .icon(ControlsIcon)
        .child(S.documentTypeList("pickerChip").title("Picker chips").defaultOrdering([{ field: "order", direction: "asc" }])),
      S.divider(),
      S.listItem()
        .title("Settings")
        .icon(CogIcon)
        .child(
          S.list()
            .title("Settings")
            .items([
              S.listItem()
                .title("Site settings")
                .icon(CogIcon)
                .child(S.document().schemaType("siteSettings").documentId(SINGLETON_IDS.siteSettings).title("Site settings")),
              S.listItem()
                .title("Contacts (private)")
                .icon(LockIcon)
                .child(S.document().schemaType("contacts").documentId(SINGLETON_IDS.contacts).title("Contacts (private)")),
            ]),
        ),
    ]);
};
