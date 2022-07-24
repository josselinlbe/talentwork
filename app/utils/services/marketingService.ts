import { MarketingFeatureDto, MarketingFeatureStatus, MarketingFeatureType } from "~/application/dtos/marketing/MarketingFeatureDto";
import { TestimonialDto } from "~/application/dtos/marketing/TestimonialDto";

export function getTestimonials(): TestimonialDto[] {
  return [
    {
      role: "Entrepreneur",
      company: "321 Founded",
      companyUrl: "https://321founded.com/",
      logoLightMode: "https://i.ibb.co/xq6B3Zb/321-Black.png",
      logoDarkMode: "https://i.ibb.co/QD0zF7m/321-White.png",
      name: "Romain Ledru-Mathé",
      personalWebsite: "https://www.linkedin.com/in/romainledrumathe",
      avatar: "https://i.imgur.com/sLdH09p.png",
      quote: "I don't know how we managed without Talentwork before, it is now an essential asset to our bussiness!",
    },
  ];
}

export function getAllFeatures(): MarketingFeatureDto[] {
  return [...getFeatures(), ...getUpcomingFeatures()];
}

export function getFeatures(): MarketingFeatureDto[] {
  return [
    {
      type: MarketingFeatureType.Core,
      name: "Hire & organise",
      status: MarketingFeatureStatus.Done,
      description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry."
    },
    {
      type: MarketingFeatureType.Core,
      name: "Onboarding & compliance",
      status: MarketingFeatureStatus.Done,
      description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry."
    },
    {
      type: MarketingFeatureType.Core,
      name: "Work & manage",
      status: MarketingFeatureStatus.Done,
      description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry."
    },
    {
      type: MarketingFeatureType.Core,
      name: "Track & pay",
      status: MarketingFeatureStatus.Done,
      description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry."
    },
    {
      type: MarketingFeatureType.Core,
      name: "Audit",
      status: MarketingFeatureStatus.Done,
      description: "Track users usage with events.",
    },
    {
      type: MarketingFeatureType.Core,
      name: "API",
      status: MarketingFeatureStatus.Done,
      description: "An API to integrate with other services.",
    },
    {
      type: MarketingFeatureType.Core,
      name: "Roles & Permissions",
      status: MarketingFeatureStatus.Done,
      description: "Roles, permissions for page views and actions & groups, and row-level permissions for security.",
    }
  ];
}

export function getUpcomingFeatures(): MarketingFeatureDto[] {
  return [
    {
      status: MarketingFeatureStatus.Done,
      name: "Workflows",
      type: MarketingFeatureType.Enterprise,
      description: "Ac tincidunt sapien vehicula erat auctor pellentesque rhoncus. Et magna sit morbi lobortis.",
      platforms: [
        {
          site: "https://www.salesforce.com/editions-pricing/sales-cloud/",
          price: "$150/month",
        },
      ],
      save: 150,
    },
    {
      status: MarketingFeatureStatus.Done,
      name: "Events & Webhooks",
      type: MarketingFeatureType.Enterprise,
      description: "Ac tincidunt sapien vehicula erat auctor pellentesque rhoncus. Et magna sit morbi lobortis.",
      platforms: [
        {
          site: "https://www.g2.com/products/zapier/pricing",
          price: "$19/month",
        },
      ],
      save: 19,
    },
    {
      status: MarketingFeatureStatus.Planned,
      name: "Internationalization",
      type: MarketingFeatureType.Enterprise,
      description: "Ac tincidunt sapien vehicula erat auctor pellentesque rhoncus. Et magna sit morbi lobortis.",
      platforms: [
        {
          site: "https://www.transifex.com/pricing/",
          price: "$105/month",
        },
      ],

      save: 105,
    },
    {
      status: MarketingFeatureStatus.Planned,
      name: "Feature Flags",
      type: MarketingFeatureType.Enterprise,
      description: "Ac tincidunt sapien vehicula erat auctor pellentesque rhoncus. Et magna sit morbi lobortis.",
      platforms: [
        {
          site: "https://flagsmith.com/pricing/",
          price: "$45/month",
        },
      ],
      save: 45,
    },
    {
      status: MarketingFeatureStatus.Planned,
      name: "Affiliate + Referral manager",
      type: MarketingFeatureType.Enterprise,
      description: "Ac tincidunt sapien vehicula erat auctor pellentesque rhoncus. Et magna sit morbi lobortis.",
      platforms: [
        {
          site: "https://tapfiliate.com/pricing/",
          price: "$149/month",
        },
      ],

      save: 149,
    },
    {
      status: MarketingFeatureStatus.Planned,
      name: "Advanced CRM",
      type: MarketingFeatureType.Enterprise,
      description: "Ac tincidunt sapien vehicula erat auctor pellentesque rhoncus. Et magna sit morbi lobortis.",
      platforms: [
        {
          site: "https://www.salesforce.com/products/sales-cloud/pricing",
          price: "$75/user/month",
        },
      ],

      save: 75,
    },
    {
      status: MarketingFeatureStatus.Planned,
      name: "Advanced Blogging",
      type: MarketingFeatureType.Enterprise,
      description: "Ac tincidunt sapien vehicula erat auctor pellentesque rhoncus. Et magna sit morbi lobortis.",
      platforms: [
        {
          site: "https://ghost.org/pricing/",
          price: "$31/month",
        },
      ],
      save: 31,
    },
    {
      status: MarketingFeatureStatus.Planned,
      name: "HelpDesk",
      type: MarketingFeatureType.Enterprise,
      description: "Ac tincidunt sapien vehicula erat auctor pellentesque rhoncus. Et magna sit morbi lobortis.",
      platforms: [
        {
          site: "https://www.intercom.com/pricing",
          price: "$300/month",
        },
      ],

      save: 300,
    },
    {
      status: MarketingFeatureStatus.Planned,
      name: "Knowledge Base Features",
      type: MarketingFeatureType.Enterprise,
      description: "Ac tincidunt sapien vehicula erat auctor pellentesque rhoncus. Et magna sit morbi lobortis.",
      platforms: [
        {
          site: "https://document360.com/pricing/",
          price: "$299/month",
        },
      ],
      save: 299,
    },
    {
      status: MarketingFeatureStatus.Planned,
      name: "Single Sign-On",
      type: MarketingFeatureType.Enterprise,
      description: "Ac tincidunt sapien vehicula erat auctor pellentesque rhoncus. Et magna sit morbi lobortis.",
      platforms: [
        {
          site: "https://workos.com/pricing",
          price: "$49/month",
        },
      ],
      save: 49,
    },
    {
      status: MarketingFeatureStatus.UnderReview,
      name: "Built-in Demo",
      type: MarketingFeatureType.Enterprise,
      description: "Ac tincidunt sapien vehicula erat auctor pellentesque rhoncus. Et magna sit morbi lobortis.",
      platforms: [
        {
          site: "https://www.demostack.com/",
          price: "?",
        },
        {
          site: "https://saleo.io/",
          price: "?",
        },
      ],

      save: 100,
    },
    {
      status: MarketingFeatureStatus.UnderReview,
      name: "Onboarding",
      type: MarketingFeatureType.Enterprise,
      description: "Ac tincidunt sapien vehicula erat auctor pellentesque rhoncus. Et magna sit morbi lobortis.",
      platforms: [
        {
          site: "https://arrows.to/pricing/",
          price: "$99/month",
        },
      ],

      save: 99,
    },
    // {
    //   status: MarketingFeatureStatus.UnderReview,
    //   name: "Product Text Editing",
    //   type: MarketingFeatureType.Enterprise,
    //   description: "Ac tincidunt sapien vehicula erat auctor pellentesque rhoncus. Et magna sit morbi lobortis.",
    //   platforms: [
    //     {
    //       site: "https://www.flycode.com/pricing",
    //       price: "$79/month",
    //     },
    //   ],

    //   save: 79,
    // },
    // {
    //   status: MarketingFeatureStatus.UnderReview,
    //   name: "Accessibility",
    //   type: MarketingFeatureType.Enterprise,
    //   description: "Ac tincidunt sapien vehicula erat auctor pellentesque rhoncus. Et magna sit morbi lobortis.",
    //   platforms: [
    //     {
    //       site: "https://accessibe.com/pricing",
    //       price: "$149/month",
    //     },
    //   ],

    //   save: 149,
    // },
  ];
}
