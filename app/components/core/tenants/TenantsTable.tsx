import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SubscriptionBillingPeriod } from "~/application/enums/subscriptions/SubscriptionBillingPeriod";
import DateUtils from "~/utils/shared/DateUtils";
import InputSearch from "~/components/ui/input/InputSearch";
import TableSimple, { Header } from "~/components/ui/tables/TableSimple";
import { TenantWithUsage } from "~/utils/db/tenants.db.server";

interface Props {
  items: TenantWithUsage[];
  withSearch: boolean;
}
export default function TenantsTable({ items, withSearch = true }: Props) {
  const { t } = useTranslation();

  const [searchInput, setSearchInput] = useState("");
  const [headers, setHeaders] = useState<Header<TenantWithUsage>[]>([]);

  useEffect(() => {
    const headers: Header<TenantWithUsage>[] = [];
    headers.push({
      name: "tenant",
      title: t("models.tenant.object"),
      value: (i) => i.name,
    });
    headers.push({
      name: "slug",
      title: t("shared.slug"),
      value: (i) => i.slug,
      href: (i) => `/app/${i.slug}`,
    });
    headers.push({
      name: "subscription",
      title: t("admin.tenants.subscription.title"),
      value: (i) => "",
      formattedValue: (item) => (
        <span>
          {item.subscription?.subscriptionPrice?.subscriptionProduct ? (
            <>
              {t(item.subscription?.subscriptionPrice?.subscriptionProduct?.title)}
              {" - "}
              <span className=" ">
                ({item.subscription?.subscriptionPrice?.price ?? "-"}/{billingPeriodName(item)})
              </span>
            </>
          ) : (
            <span className="italic text-gray-500">{t("settings.subscription.noSubscription")}</span>
          )}
        </span>
      ),
    });
    headers.push({
      name: "users",
      title: t("models.user.plural"),
      value: (i) => i._count.users,
    });
    headers.push({
      name: "rows",
      title: t("models.entity.rows"),
      value: (i) => i._count.rows,
    });
    // entities.forEach((entity) => {
    //   headers.push({
    //     name: entity.name,
    //     title: t(entity.titlePlural),
    //     value: (i) => "0",
    //   });
    // });
    headers.push({
      name: "createdAt",
      title: t("shared.createdAt"),
      value: (i) => i.createdAt,
      formattedValue: (item) => (
        <time dateTime={DateUtils.dateYMDHMS(item.createdAt)} title={DateUtils.dateYMDHMS(item.createdAt)}>
          {DateUtils.dateAgo(item.createdAt)}
        </time>
      ),
    });
    setHeaders(headers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const orderedItems = () => {
    if (!filteredItems()) {
      return [];
    }
    return filteredItems()
      .slice()
      .sort((x, y) => {
        if (x.createdAt && y.createdAt) {
          return (x.createdAt > y.createdAt ? -1 : 1) ?? -1;
        }
        return -1;
      });
  };
  const filteredItems = () => {
    if (!items) {
      return [];
    }
    return items.filter((f) => f.name?.toString().toUpperCase().includes(searchInput.toUpperCase()));
  };
  function billingPeriodName(item: TenantWithUsage) {
    return t("pricing." + SubscriptionBillingPeriod[item.subscription?.subscriptionPrice?.billingPeriod ?? SubscriptionBillingPeriod.MONTHLY] + "Short");
  }

  return (
    <div className="space-y-2">
      {withSearch && <InputSearch value={searchInput} setValue={setSearchInput} />}
      <TableSimple
        items={orderedItems()}
        headers={headers}
        actions={[
          {
            title: t("admin.tenants.overview"),
            onClickRoute: (_, item) => `/admin/accounts/${item.id}`,
          },
        ]}
      />
    </div>
  );
}
