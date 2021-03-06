import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SubscriptionBillingPeriod } from "~/application/enums/subscriptions/SubscriptionBillingPeriod";
import DateUtils from "~/utils/shared/DateUtils";
import TableSimple from "~/components/ui/tables/TableSimple";
import { TenantWithUsage } from "~/utils/db/tenants.db.server";
import { RowHeaderDisplayDto } from "~/application/dtos/data/RowHeaderDisplayDto";
import { Link } from "react-router-dom";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";

interface Props {
  items: TenantWithUsage[];
  pagination: PaginationDto;
}
export default function TenantsTable({ items, pagination }: Props) {
  const { t } = useTranslation();

  const [headers, setHeaders] = useState<RowHeaderDisplayDto<TenantWithUsage>[]>([]);

  useEffect(() => {
    const headers: RowHeaderDisplayDto<TenantWithUsage>[] = [];
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
      href: (i) => `/admin/users?tenantId=${i.id}`,
    });
    headers.push({
      name: "rows",
      title: t("models.entity.rows"),
      value: (i) => i._count.rows,
    });
    headers.push({
      name: "events",
      title: "Events",
      value: (i) => i._count.events,
      formattedValue: (i) => <Link to={`/admin/events?tenantId=${i.id}`}>{i._count.events}</Link>,
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

  function billingPeriodName(item: TenantWithUsage) {
    return t("pricing." + SubscriptionBillingPeriod[item.subscription?.subscriptionPrice?.billingPeriod ?? SubscriptionBillingPeriod.MONTHLY] + "Short");
  }

  return (
    <div className="space-y-2">
      <TableSimple
        items={items}
        headers={headers}
        actions={[
          {
            title: t("admin.tenants.overview"),
            onClickRoute: (_, item) => `/admin/accounts/${item.id}`,
          },
        ]}
        pagination={pagination}
      />
    </div>
  );
}
