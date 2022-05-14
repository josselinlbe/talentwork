-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "defaultTenantId" TEXT,
    "verifyToken" TEXT
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "userId" TEXT NOT NULL,
    "role" INTEGER NOT NULL,
    CONSTRAINT "AdminUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" TEXT,
    "userId" TEXT,
    "apiKeyId" TEXT,
    "entityRowId" TEXT,
    "url" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    CONSTRAINT "Log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Log_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Log_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "ApiKey" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Log_entityRowId_fkey" FOREIGN KEY ("entityRowId") REFERENCES "EntityRow" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "subscriptionId" TEXT
);

-- CreateTable
CREATE TABLE "TenantSubscription" (
    "tenantId" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "subscriptionPriceId" TEXT,
    "quantity" INTEGER NOT NULL,
    CONSTRAINT "TenantSubscription_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TenantSubscription_subscriptionPriceId_fkey" FOREIGN KEY ("subscriptionPriceId") REFERENCES "SubscriptionPrice" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TenantUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" INTEGER NOT NULL,
    "joined" INTEGER NOT NULL,
    "status" INTEGER NOT NULL,
    CONSTRAINT "TenantUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TenantUser_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantUserId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "UserRole_tenantUserId_fkey" FOREIGN KEY ("tenantUserId") REFERENCES "TenantUser" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TenantUserInvitation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" INTEGER NOT NULL,
    "pending" BOOLEAN NOT NULL,
    "createdUserId" TEXT,
    CONSTRAINT "TenantUserInvitation_createdUserId_fkey" FOREIGN KEY ("createdUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TenantUserInvitation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "max" INTEGER NOT NULL,
    "expires" DATETIME NOT NULL,
    "active" BOOLEAN NOT NULL,
    CONSTRAINT "ApiKey_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ApiKey_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ApiKeyEntity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "apiKeyId" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "create" BOOLEAN NOT NULL,
    "read" BOOLEAN NOT NULL,
    "update" BOOLEAN NOT NULL,
    "delete" BOOLEAN NOT NULL,
    CONSTRAINT "ApiKeyEntity_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "ApiKey" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ApiKeyEntity_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ApiKeyLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "apiKeyId" TEXT,
    "ip" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "params" TEXT NOT NULL,
    "status" INTEGER,
    "error" TEXT,
    CONSTRAINT "ApiKeyLog_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "ApiKey" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SubscriptionProduct" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stripeId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "badge" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "model" INTEGER NOT NULL,
    "public" BOOLEAN NOT NULL
);

-- CreateTable
CREATE TABLE "SubscriptionPrice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subscriptionProductId" TEXT NOT NULL,
    "stripeId" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "billingPeriod" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "trialDays" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL,
    CONSTRAINT "SubscriptionPrice_subscriptionProductId_fkey" FOREIGN KEY ("subscriptionProductId") REFERENCES "SubscriptionProduct" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SubscriptionFeature" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subscriptionProductId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "value" INTEGER NOT NULL,
    CONSTRAINT "SubscriptionFeature_subscriptionProductId_fkey" FOREIGN KEY ("subscriptionProductId") REFERENCES "SubscriptionProduct" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LinkedAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" TEXT NOT NULL,
    "createdByTenantId" TEXT NOT NULL,
    "providerTenantId" TEXT NOT NULL,
    "clientTenantId" TEXT NOT NULL,
    "status" INTEGER NOT NULL,
    CONSTRAINT "LinkedAccount_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LinkedAccount_createdByTenantId_fkey" FOREIGN KEY ("createdByTenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LinkedAccount_providerTenantId_fkey" FOREIGN KEY ("providerTenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LinkedAccount_clientTenantId_fkey" FOREIGN KEY ("clientTenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BlogAuthor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "slug" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "url" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "BlogCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "color" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "BlogTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "color" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "BlogPostTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    CONSTRAINT "BlogPostTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "BlogTag" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BlogPostTag_postId_fkey" FOREIGN KEY ("postId") REFERENCES "BlogPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "image" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "readingTime" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL,
    "authorId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    CONSTRAINT "BlogPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "BlogAuthor" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BlogPost_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "BlogCategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Entity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "prefix" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titlePlural" TEXT NOT NULL,
    "isFeature" BOOLEAN NOT NULL,
    "isAutogenerated" BOOLEAN NOT NULL,
    "hasApi" BOOLEAN NOT NULL,
    "requiresLinkedAccounts" BOOLEAN NOT NULL,
    "icon" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL
);

-- CreateTable
CREATE TABLE "EntityProperty" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityId" TEXT NOT NULL,
    "isDynamic" BOOLEAN NOT NULL,
    "order" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "formula" TEXT,
    "parentId" TEXT,
    "isDefault" BOOLEAN NOT NULL,
    "isRequired" BOOLEAN NOT NULL,
    "isHidden" BOOLEAN NOT NULL,
    "isDetail" BOOLEAN NOT NULL,
    "pattern" TEXT,
    CONSTRAINT "EntityProperty_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EntityProperty_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "EntityProperty" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EntityPropertyOption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityPropertyId" TEXT NOT NULL,
    "parentId" TEXT,
    "order" INTEGER NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "EntityPropertyOption_entityPropertyId_fkey" FOREIGN KEY ("entityPropertyId") REFERENCES "EntityProperty" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EntityPropertyOption_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "EntityPropertyOption" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EntityRow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "folio" INTEGER NOT NULL,
    "entityId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdByUserId" TEXT,
    "createdByApiKeyId" TEXT,
    "linkedAccountId" TEXT,
    "contractId" TEXT,
    "employeeId" TEXT,
    CONSTRAINT "EntityRow_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EntityRow_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EntityRow_createdByApiKeyId_fkey" FOREIGN KEY ("createdByApiKeyId") REFERENCES "ApiKey" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EntityRow_linkedAccountId_fkey" FOREIGN KEY ("linkedAccountId") REFERENCES "LinkedAccount" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EntityRow_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EntityRowValue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityRowId" TEXT NOT NULL,
    "entityPropertyId" TEXT NOT NULL,
    "relatedRowId" TEXT,
    "idValue" TEXT,
    "textValue" TEXT,
    "numberValue" DECIMAL,
    "dateValue" DATETIME,
    CONSTRAINT "EntityRowValue_entityPropertyId_fkey" FOREIGN KEY ("entityPropertyId") REFERENCES "EntityProperty" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EntityRowValue_entityRowId_fkey" FOREIGN KEY ("entityRowId") REFERENCES "EntityRow" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EntityRowValue_relatedRowId_fkey" FOREIGN KEY ("relatedRowId") REFERENCES "EntityRow" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityRowValueId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "file" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    CONSTRAINT "Media_entityRowValueId_fkey" FOREIGN KEY ("entityRowValueId") REFERENCES "EntityRowValue" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EntityTenantUserPermission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    CONSTRAINT "EntityTenantUserPermission_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EntityWebhook" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    CONSTRAINT "EntityWebhook_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EntityWebhookLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "webhookId" TEXT NOT NULL,
    "logId" TEXT NOT NULL,
    "status" INTEGER NOT NULL,
    "error" TEXT,
    CONSTRAINT "EntityWebhookLog_logId_fkey" FOREIGN KEY ("logId") REFERENCES "Log" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EntityWebhookLog_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "EntityWebhook" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityRowId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    CONSTRAINT "Employee_entityRowId_fkey" FOREIGN KEY ("entityRowId") REFERENCES "EntityRow" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityRowId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "file" TEXT NOT NULL,
    "status" INTEGER NOT NULL,
    CONSTRAINT "Contract_entityRowId_fkey" FOREIGN KEY ("entityRowId") REFERENCES "EntityRow" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContractMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contractId" TEXT NOT NULL,
    "role" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "signDate" DATETIME,
    CONSTRAINT "ContractMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContractMember_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContractEmployee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contractId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    CONSTRAINT "ContractEmployee_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ContractEmployee_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContractActivity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    CONSTRAINT "ContractActivity_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContractActivity_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_userId_key" ON "AdminUser"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "TenantSubscription_tenantId_key" ON "TenantSubscription"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantUserInvitation_createdUserId_key" ON "TenantUserInvitation"("createdUserId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_tenantId_alias_key" ON "ApiKey"("tenantId", "alias");

-- CreateIndex
CREATE UNIQUE INDEX "BlogAuthor_slug_key" ON "BlogAuthor"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BlogCategory_name_key" ON "BlogCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BlogTag_name_key" ON "BlogTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Entity_name_key" ON "Entity"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Entity_slug_key" ON "Entity"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Entity_order_key" ON "Entity"("order");

-- CreateIndex
CREATE UNIQUE INDEX "Entity_prefix_key" ON "Entity"("prefix");

-- CreateIndex
CREATE UNIQUE INDEX "EntityProperty_entityId_order_key" ON "EntityProperty"("entityId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "EntityProperty_entityId_name_key" ON "EntityProperty"("entityId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "EntityProperty_entityId_title_key" ON "EntityProperty"("entityId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_entityRowId_key" ON "Employee"("entityRowId");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_entityRowId_key" ON "Contract"("entityRowId");
