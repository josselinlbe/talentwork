const tenantCondition = (
  tenantId: string
): {
  OR: [
    {
      visibility: string;
    },
    {
      tenantId: string;
    },
    {
      linkedAccount: {
        OR: {
          providerTenantId?: string;
          clientTenantId?: string;
        }[];
      };
    }
  ];
} => {
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
};

export default {
  tenantCondition,
};
