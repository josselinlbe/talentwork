const tenantCondition = (
  tenantId: string | null
): {
  OR: [
    {
      visibility: string;
    },
    {
      tenantId: string | null;
    },
    (
      | {
          linkedAccount: {
            OR: {
              providerTenantId?: string;
              clientTenantId?: string;
            }[];
          };
        }
      | {}
    )
  ];
} => {
  if (tenantId) {
    return {
      OR: [
        {
          visibility: "public",
        },
        {
          tenantId,
        },
        {
          linkedAccount: {
            OR: [
              {
                providerTenantId: tenantId,
              },
              {
                clientTenantId: tenantId,
              },
            ],
          },
        },
      ],
    };
  }
  return {
    OR: [
      {
        visibility: "public",
      },
      {
        tenantId,
      },
      {},
    ],
  };
};

export default {
  tenantCondition,
};
