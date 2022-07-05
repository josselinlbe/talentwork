---
meta:
  title: SaasRock releases | Guides | Learning Center | SaasRock
  description: Learn how to add another language translations
headers:
  Cache-Control: no-cache
---

import DocBreadcrumb from "~/components/ui/docs/DocBreadcrumb";
import DocTutorialImage from "~/components/ui/docs/DocTutorialImage";
import WarningBanner from "~/components/ui/banners/WarningBanner";

<DocBreadcrumb
items={[
{
title: "Learning Center",
routePath: "/docs/learning-center",
},
{
title: "Guides",
routePath: "",
},
{
title: "SaasRock releases",
routePath:
"/docs/learning-center/guides/upgrade/stay-up-to-date-with-saasrock-releases",
},
]}
/>

# SaasRock releases

The following steps are my recommendation to constantly stay up to date with SaasRock releases.

<WarningBanner title="WARNING">
  There will be constant breaking changes until SaasRock is stable. 
  This gives me the flexibility to add new features with freedom.
</WarningBanner>

💿 Create a private GitHub repository with the SaasRock's latest release.

💿 Set SaasRock as the upstream

```shell
git remote add upstream https://github.com/AlexandroMtzG/saasrock.git
```

💿 _(Optional)_ [Remove push to upstream](https://stackoverflow.com/a/10260389/5697060).

```shell
git remote set-url --push upstream no_push
```

If you run git remote -v you should get something like this:

```shell
origin  https://github.com/{YOU}/{YOUR_PRIVATE_REPO}.git (fetch)
origin  https://github.com/{YOU}/{YOUR_PRIVATE_REPO}.git (push)
upstream        https://github.com/AlexandroMtzG/saasrock.git (fetch)
upstream        no_push (push)
```

💿 Anytime you want to get the latest changes, run:

```shell
git pull upstream main
```

This way you decide when to pull the latest features.

---

I hope this quick guide was useful! [Let me know](/docs/community) if you have any question.
