const tenantCondition = (
  tenantId: string
): {
  OR: [
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
