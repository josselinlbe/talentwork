-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "avatar" TEXT,
    "phone" TEXT,
    "defaultTenantId" TEXT,
    "verifyToken" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "userId" TEXT NOT NULL,
    "role" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "subscriptionId" TEXT,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantSubscription" (
    "tenantId" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "subscriptionPriceId" TEXT,
    "quantity" INTEGER
);

-- CreateTable
CREATE TABLE "TenantUser" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "joined" INTEGER NOT NULL,
    "status" INTEGER NOT NULL,

    CONSTRAINT "TenantUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "assignToNewUsers" BOOLEAN NOT NULL,
    "isDefault" BOOLEAN NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "tenantId" TEXT,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "color" INTEGER NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupUser" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "GroupUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantUserRole" (
    "id" TEXT NOT NULL,
    "tenantUserId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "TenantUserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantUserInvitation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "pending" BOOLEAN NOT NULL,
    "createdUserId" TEXT,

    CONSTRAINT "TenantUserInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkedAccount" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" TEXT NOT NULL,
    "createdByTenantId" TEXT NOT NULL,
    "providerTenantId" TEXT NOT NULL,
    "clientTenantId" TEXT NOT NULL,
    "status" INTEGER NOT NULL,

    CONSTRAINT "LinkedAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "max" INTEGER NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKeyEntity" (
    "id" TEXT NOT NULL,
    "apiKeyId" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "create" BOOLEAN NOT NULL,
    "read" BOOLEAN NOT NULL,
    "update" BOOLEAN NOT NULL,
    "delete" BOOLEAN NOT NULL,

    CONSTRAINT "ApiKeyEntity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" TEXT,
    "userId" TEXT,
    "apiKeyId" TEXT,
    "rowId" TEXT,
    "url" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKeyLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "apiKeyId" TEXT,
    "ip" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "params" TEXT NOT NULL,
    "status" INTEGER,
    "error" TEXT,

    CONSTRAINT "ApiKeyLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionProduct" (
    "id" TEXT NOT NULL,
    "stripeId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "model" INTEGER NOT NULL,
    "public" BOOLEAN NOT NULL,
    "description" TEXT,
    "badge" TEXT,

    CONSTRAINT "SubscriptionProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionPrice" (
    "id" TEXT NOT NULL,
    "subscriptionProductId" TEXT NOT NULL,
    "stripeId" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "billingPeriod" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "trialDays" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL,

    CONSTRAINT "SubscriptionPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionFeature" (
    "id" TEXT NOT NULL,
    "subscriptionProductId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "value" INTEGER NOT NULL,

    CONSTRAINT "SubscriptionFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogAuthor" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "slug" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "BlogAuthor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogCategory" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "color" INTEGER NOT NULL,

    CONSTRAINT "BlogCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogTag" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "color" INTEGER NOT NULL,

    CONSTRAINT "BlogTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPostTag" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "BlogPostTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "image" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "readingTime" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL,
    "authorId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entity" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
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
    "active" BOOLEAN NOT NULL,

    CONSTRAINT "Entity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "formula" TEXT,
    "parentId" TEXT,
    "isDynamic" BOOLEAN NOT NULL,
    "isDefault" BOOLEAN NOT NULL,
    "isRequired" BOOLEAN NOT NULL,
    "isHidden" BOOLEAN NOT NULL,
    "isDetail" BOOLEAN NOT NULL,
    "pattern" TEXT,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyOption" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "parentId" TEXT,
    "order" INTEGER NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "PropertyOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Row" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "entityId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "folio" INTEGER NOT NULL,
    "createdByUserId" TEXT,
    "createdByApiKeyId" TEXT,
    "linkedAccountId" TEXT,
    "contractId" TEXT,
    "visibility" TEXT NOT NULL DEFAULT E'private',
    "canComment" BOOLEAN NOT NULL DEFAULT true,
    "canUpdate" BOOLEAN NOT NULL DEFAULT true,
    "canDelete" BOOLEAN NOT NULL DEFAULT true,
    "parentRowId" TEXT,

    CONSTRAINT "Row_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RowValue" (
    "id" TEXT NOT NULL,
    "rowId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "relatedRowId" TEXT,
    "idValue" TEXT,
    "textValue" TEXT,
    "numberValue" DECIMAL(65,30),
    "dateValue" TIMESTAMP(3),
    "booleanValue" BOOLEAN,

    CONSTRAINT "RowValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RowPermission" (
    "id" TEXT NOT NULL,
    "rowId" TEXT NOT NULL,
    "tenantId" TEXT,
    "groupId" TEXT,
    "userId" TEXT,

    CONSTRAINT "RowPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "rowValueId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "file" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntityTenantUserPermission" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,

    CONSTRAINT "EntityTenantUserPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntityWebhook" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,

    CONSTRAINT "EntityWebhook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntityWebhookLog" (
    "id" TEXT NOT NULL,
    "webhookId" TEXT NOT NULL,
    "logId" TEXT NOT NULL,
    "status" INTEGER NOT NULL,
    "error" TEXT,

    CONSTRAINT "EntityWebhookLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "rowId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "file" TEXT NOT NULL,
    "status" INTEGER NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractMember" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "role" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "signDate" TIMESTAMP(3),

    CONSTRAINT "ContractMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractEmployee" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "rowId" TEXT NOT NULL,

    CONSTRAINT "ContractEmployee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractActivity" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "type" INTEGER NOT NULL,

    CONSTRAINT "ContractActivity_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_name_key" ON "Permission"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_userId_roleId_tenantId_key" ON "UserRole"("userId", "roleId", "tenantId");

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
CREATE UNIQUE INDEX "Property_entityId_order_key" ON "Property"("entityId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Property_entityId_name_key" ON "Property"("entityId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Property_entityId_title_key" ON "Property"("entityId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_rowId_key" ON "Contract"("rowId");

-- AddForeignKey
ALTER TABLE "AdminUser" ADD CONSTRAINT "AdminUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantSubscription" ADD CONSTRAINT "TenantSubscription_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantSubscription" ADD CONSTRAINT "TenantSubscription_subscriptionPriceId_fkey" FOREIGN KEY ("subscriptionPriceId") REFERENCES "SubscriptionPrice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantUser" ADD CONSTRAINT "TenantUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantUser" ADD CONSTRAINT "TenantUser_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupUser" ADD CONSTRAINT "GroupUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupUser" ADD CONSTRAINT "GroupUser_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantUserRole" ADD CONSTRAINT "TenantUserRole_tenantUserId_fkey" FOREIGN KEY ("tenantUserId") REFERENCES "TenantUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantUserInvitation" ADD CONSTRAINT "TenantUserInvitation_createdUserId_fkey" FOREIGN KEY ("createdUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantUserInvitation" ADD CONSTRAINT "TenantUserInvitation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkedAccount" ADD CONSTRAINT "LinkedAccount_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkedAccount" ADD CONSTRAINT "LinkedAccount_createdByTenantId_fkey" FOREIGN KEY ("createdByTenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkedAccount" ADD CONSTRAINT "LinkedAccount_providerTenantId_fkey" FOREIGN KEY ("providerTenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkedAccount" ADD CONSTRAINT "LinkedAccount_clientTenantId_fkey" FOREIGN KEY ("clientTenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKeyEntity" ADD CONSTRAINT "ApiKeyEntity_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "ApiKey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKeyEntity" ADD CONSTRAINT "ApiKeyEntity_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "ApiKey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_rowId_fkey" FOREIGN KEY ("rowId") REFERENCES "Row"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKeyLog" ADD CONSTRAINT "ApiKeyLog_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "ApiKey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionPrice" ADD CONSTRAINT "SubscriptionPrice_subscriptionProductId_fkey" FOREIGN KEY ("subscriptionProductId") REFERENCES "SubscriptionProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionFeature" ADD CONSTRAINT "SubscriptionFeature_subscriptionProductId_fkey" FOREIGN KEY ("subscriptionProductId") REFERENCES "SubscriptionProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostTag" ADD CONSTRAINT "BlogPostTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "BlogTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostTag" ADD CONSTRAINT "BlogPostTag_postId_fkey" FOREIGN KEY ("postId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "BlogAuthor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "BlogCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyOption" ADD CONSTRAINT "PropertyOption_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyOption" ADD CONSTRAINT "PropertyOption_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "PropertyOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Row" ADD CONSTRAINT "Row_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Row" ADD CONSTRAINT "Row_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Row" ADD CONSTRAINT "Row_linkedAccountId_fkey" FOREIGN KEY ("linkedAccountId") REFERENCES "LinkedAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Row" ADD CONSTRAINT "Row_createdByApiKeyId_fkey" FOREIGN KEY ("createdByApiKeyId") REFERENCES "ApiKey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Row" ADD CONSTRAINT "Row_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Row" ADD CONSTRAINT "Row_parentRowId_fkey" FOREIGN KEY ("parentRowId") REFERENCES "Row"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RowValue" ADD CONSTRAINT "RowValue_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RowValue" ADD CONSTRAINT "RowValue_rowId_fkey" FOREIGN KEY ("rowId") REFERENCES "Row"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RowValue" ADD CONSTRAINT "RowValue_relatedRowId_fkey" FOREIGN KEY ("relatedRowId") REFERENCES "Row"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RowPermission" ADD CONSTRAINT "RowPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RowPermission" ADD CONSTRAINT "RowPermission_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RowPermission" ADD CONSTRAINT "RowPermission_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RowPermission" ADD CONSTRAINT "RowPermission_rowId_fkey" FOREIGN KEY ("rowId") REFERENCES "Row"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_rowValueId_fkey" FOREIGN KEY ("rowValueId") REFERENCES "RowValue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityTenantUserPermission" ADD CONSTRAINT "EntityTenantUserPermission_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityWebhook" ADD CONSTRAINT "EntityWebhook_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityWebhookLog" ADD CONSTRAINT "EntityWebhookLog_logId_fkey" FOREIGN KEY ("logId") REFERENCES "Log"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityWebhookLog" ADD CONSTRAINT "EntityWebhookLog_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "EntityWebhook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_rowId_fkey" FOREIGN KEY ("rowId") REFERENCES "Row"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractMember" ADD CONSTRAINT "ContractMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractMember" ADD CONSTRAINT "ContractMember_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractEmployee" ADD CONSTRAINT "ContractEmployee_rowId_fkey" FOREIGN KEY ("rowId") REFERENCES "Row"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractEmployee" ADD CONSTRAINT "ContractEmployee_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractActivity" ADD CONSTRAINT "ContractActivity_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractActivity" ADD CONSTRAINT "ContractActivity_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;
