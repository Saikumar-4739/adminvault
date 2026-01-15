import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CompanyInfoEntity } from '../masters/entities/company-info.entity';
import { DepartmentsMasterEntity } from '../masters/entities/department.entity';
import { LocationsMasterEntity } from '../masters/entities/location.entity';
import { AuthUsersEntity } from '../auth-users/entities/auth-users.entity';
import { RoleEntity } from './entities/role.entity';
import { PermissionEntity } from './entities/permission.entity';
import { MenuEntity } from './entities/menu.entity';
import { EmployeesEntity } from '../employees/entities/employees.entity';
import { AssetInfoEntity } from '../asset-info/entities/asset-info.entity';
import { TicketCategoriesMasterEntity } from '../masters/entities/ticket-category.entity';
import { TicketsEntity } from '../tickets/entities/tickets.entity';
import { DeviceInfoEntity } from '../masters/entities/device-info.entity';
import { BrandsMasterEntity } from '../masters/entities/brand.entity';
import { ApplicationsMasterEntity } from '../masters/entities/application.entity';
import { VendorsMasterEntity } from '../masters/entities/vendor.entity';
import { PurchaseOrderEntity } from '../procurement/entities/purchase-order.entity';
import { PurchaseOrderItemEntity } from '../procurement/entities/purchase-order-item.entity';
import { KnowledgeArticleEntity } from '../knowledge-base/entities/knowledge-article.entity';
import { DocumentEntity } from '../documents/entities/document.entity';
import { CompanyLicenseEntity } from '../licenses/entities/company-license.entity';
import { SettingType, TicketStatusEnum, TicketPriorityEnum, TicketCategoryEnum, EmployeeStatusEnum, UserRoleEnum, AssetStatusEnum, DeviceTypeEnum, POStatusEnum, KnowledgeCategoryEnum, MaintenanceStatusEnum, MaintenanceTypeEnum, EmailTypeEnum } from '@adminvault/shared-models';
import * as bcrypt from 'bcrypt';
import { RoleMenuAccessEntity } from './entities/role-menu-access.entity';
import { RolePermissionEntity } from './entities/role-permission.entity';
import { UserRoleEntity } from './entities/user-role.entity';
import { ScopeEntity } from './entities/scope.entity';
import { PasswordVaultEntity } from './entities/password-vault.entity';
import { SettingsEntity } from './entities/settings.entity';
import { EmailInfoEntity } from './entities/email-info.entity';
import { MaintenanceScheduleEntity } from '../asset-info/entities/maintenance-schedule.entity';

@Injectable()
export class SeedService {
    constructor(private dataSource: DataSource) { }

    async seedAll() {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            console.log('SEED: Clearing existing data...');

            const tables = [
                'role_menu_access', 'role_permissions', 'user_roles', 'user_permissions',
                'mfa_settings', 'api_keys', 'user_login_sessions', 'password_vault',
                'asset_assign', 'maintenance_schedule', 'asset_software', 'asset_return_history',
                'asset_next_assignment', 'asset_info', 'purchase_order_items', 'purchase_orders',
                'ticket_comments', 'ticket_messages', 'ticket_status_logs', 'ticket_work_log',
                'tickets', 'approval_requests', 'knowledge_articles', 'documents',
                'company_license', 'employees', 'auth_users', 'departments',
                'locations', 'vendors', 'device_brands', 'asset_types', 'ticket_categories',
                'applications', 'expense_categories', 'menus', 'permissions',
                'roles', 'company_info', 'scopes', 'settings', 'device_info', 'email_info', 'licenses',
                'maintenance_schedules'
            ];

            await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0');
            for (const table of tables) {
                try {
                    await queryRunner.query(`TRUNCATE TABLE \`${table}\``);
                } catch (e) {
                    console.warn(`Could not truncate ${table}: ${e.message}`);
                }
            }
            await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1');

            console.log('SEED: Inserting fresh data...');

            // 1. Company
            const company = new CompanyInfoEntity();
            company.companyName = 'AdminVault Corp';
            company.location = 'Cyber City, Hyderabad';
            company.estDate = new Date('2020-01-01');
            company.email = 'hq@adminvault.com';
            company.phone = '+91 40 1234 5678';
            const savedCompany = await queryRunner.manager.save(company);
            const companyId = Number(savedCompany.id);

            // 2. Locations
            const locNames = ['Hyderabad HQ', 'Bangalore Branch', 'Delhi Sales Office', 'Remote'];
            const savedLocs = [];
            for (const name of locNames) {
                const loc = new LocationsMasterEntity();
                loc.name = name;
                loc.isActive = true;
                savedLocs.push(await queryRunner.manager.save(loc));
            }

            // 3. Departments
            const deptNames = ['Engineering', 'Human Resources', 'Operations', 'IT Support', 'Finance', 'Sales'];
            const savedDepts = [];
            for (const name of deptNames) {
                const dept = new DepartmentsMasterEntity();
                dept.name = name;
                savedDepts.push(await queryRunner.manager.save(dept));
            }

            // 4. Vendors & Apps
            const vendor = new VendorsMasterEntity();
            vendor.name = 'Cloud Services Inc';
            vendor.code = 'CSI';
            vendor.isActive = true;
            const savedVendor = await queryRunner.manager.save(vendor);

            const app = new ApplicationsMasterEntity();
            app.name = 'Adobe Creative Cloud';
            app.isActive = true;
            const savedApp = await queryRunner.manager.save(app);

            // 5. Brands & Device Info
            const brand = new BrandsMasterEntity();
            brand.name = 'Apple';
            brand.code = 'APPLE';
            brand.isActive = true;
            const savedBrand = await queryRunner.manager.save(brand);

            const device = new DeviceInfoEntity();
            device.deviceType = DeviceTypeEnum.LAPTOP;
            device.deviceName = 'MacBook Pro';
            device.brandName = 'Apple';
            device.model = 'M2 Pro';
            const savedDevice = await queryRunner.manager.save(device);

            // 6. Permissions
            const permsData = [
                { name: 'Read Assets', code: 'ASSET_READ', resource: 'Asset', action: 'READ' },
                { name: 'Write Assets', code: 'ASSET_WRITE', resource: 'Asset', action: 'WRITE' },
                { name: 'Read Tickets', code: 'TICKET_READ', resource: 'Ticket', action: 'READ' },
                { name: 'Write Tickets', code: 'TICKET_WRITE', resource: 'Ticket', action: 'WRITE' },
                { name: 'Admin IAM', code: 'IAM_ADMIN', resource: 'IAM', action: 'ADMIN' },
                { name: 'Read Reports', code: 'REPORT_READ', resource: 'Report', action: 'READ' }
            ];
            const savedPerms = [];
            for (const p of permsData) {
                const perm = new PermissionEntity();
                Object.assign(perm, p);
                perm.isActive = true;
                savedPerms.push(await queryRunner.manager.save(perm));
            }

            // 7. Roles
            const rolesData = [
                { name: 'Super Administrator', code: 'SUPERADMIN', userRole: UserRoleEnum.SUPER_ADMIN },
                { name: 'IT Administrator', code: 'ADMIN', userRole: UserRoleEnum.ADMIN },
                { name: 'Department Manager', code: 'MANAGER', userRole: UserRoleEnum.MANAGER },
                { name: 'Standard User', code: 'USER', userRole: UserRoleEnum.USER }
            ];
            const savedRoles = [];
            for (const r of rolesData) {
                const role = new RoleEntity();
                role.name = r.name;
                role.code = r.code;
                role.companyId = companyId;
                role.userRole = r.userRole;
                role.isSystemRole = true;
                savedRoles.push(await queryRunner.manager.save(role));
            }

            const adminRole = savedRoles.find(r => r.code === 'ADMIN');
            for (const p of savedPerms) {
                const rp = new RolePermissionEntity();
                rp.roleId = Number(adminRole.id);
                rp.permissionId = Number(p.id);
                await queryRunner.manager.save(rp);
            }

            // 8. Menus
            const parentMenus = [
                { label: 'System', code: 'NAV_SYSTEM', icon: 'LayoutDashboard', sort: 1 },
                { label: 'Operations', code: 'NAV_OPERATIONS', icon: 'Package', sort: 2 },
                { label: 'Support Portal', code: 'NAV_SUPPORT', icon: 'Ticket', sort: 3 },
                { label: 'Security', code: 'NAV_SECURITY', icon: 'ShieldAlert', sort: 4 }
            ];
            for (const pm of parentMenus) {
                const m = new MenuEntity();
                m.label = pm.label;
                m.code = pm.code;
                m.icon = pm.icon;
                m.sortOrder = pm.sort;
                const savedM = await queryRunner.manager.save(m);

                const rma = new RoleMenuAccessEntity();
                rma.roleId = Number(adminRole.id);
                rma.menuId = Number(savedM.id);
                rma.canRead = true;
                rma.canCreate = true;
                rma.canUpdate = true;
                rma.canDelete = true;
                rma.canApprove = true;
                await queryRunner.manager.save(rma);
            }

            // 9. Scopes
            const scopes = [
                { name: 'Full Access', code: 'SCOPE_ALL', description: 'Everything' },
                { name: 'Read Only', code: 'SCOPE_READ', description: 'View only access' }
            ];
            for (const s of scopes) {
                const sc = new ScopeEntity();
                Object.assign(sc, s);
                await queryRunner.manager.save(sc);
            }

            // 10. Users & Employees
            const hashedPassword = await bcrypt.hash('Admin@123', 10);
            const user1 = new AuthUsersEntity();
            user1.fullName = 'System Administrator';
            user1.email = 'admin@adminvault.com';
            user1.passwordHash = hashedPassword;
            user1.userRole = UserRoleEnum.SUPER_ADMIN;
            user1.companyId = companyId;
            user1.status = true;
            user1.employeeId = 'EMP001';
            const savedUser = await queryRunner.manager.save(user1);
            const adminUserId = Number(savedUser.id);

            const ur = new UserRoleEntity();
            ur.userId = adminUserId;
            ur.roleId = Number(adminRole.id);
            await queryRunner.manager.save(ur);

            const emp1 = new EmployeesEntity();
            emp1.firstName = 'Sai';
            emp1.lastName = 'Kumar';
            emp1.email = 'sai@adminvault.com';
            emp1.phNumber = '9876543210';
            emp1.empStatus = EmployeeStatusEnum.ACTIVE;
            emp1.departmentId = Number(savedDepts[0].id);
            emp1.companyId = companyId;
            const savedEmp = await queryRunner.manager.save(emp1);

            // 11. Assets & Maintenance
            const asset1 = new AssetInfoEntity();
            asset1.model = 'MacBook Pro M2 Pro 14"';
            asset1.serialNumber = 'serial_mbp_001';
            asset1.assetStatusEnum = AssetStatusEnum.AVAILABLE;
            asset1.companyId = companyId;
            asset1.deviceId = Number(savedDevice.id);
            asset1.brandId = Number(savedBrand.id);
            const savedAsset = await queryRunner.manager.save(asset1);

            const maint = new MaintenanceScheduleEntity();
            maint.assetId = Number(savedAsset.id);
            maint.scheduledDate = new Date();
            maint.maintenanceType = MaintenanceTypeEnum.PREVENTIVE;
            maint.status = MaintenanceStatusEnum.SCHEDULED;
            maint.companyId = companyId;
            await queryRunner.manager.save(maint);

            // 12. Tickets
            const ticket1 = new TicketsEntity();
            ticket1.subject = 'Need Adobe Creative Cloud License';
            ticket1.description = 'Required for marketing campaign assets.';
            ticket1.ticketStatus = TicketStatusEnum.PENDING;
            ticket1.priorityEnum = TicketPriorityEnum.MEDIUM;
            ticket1.categoryEnum = TicketCategoryEnum.SOFTWARE;
            ticket1.ticketCode = 'TICK-001';
            ticket1.companyId = companyId;
            ticket1.employeeId = Number(savedEmp.id);
            await queryRunner.manager.save(ticket1);

            // 13. Procurement (Purchase Orders)
            const po = new PurchaseOrderEntity();
            po.poNumber = 'PO-2024-001';
            po.vendorId = Number(savedVendor.id);
            po.requesterId = Number(savedEmp.id);
            po.orderDate = new Date();
            po.status = POStatusEnum.DRAFT;
            po.totalAmount = 2500.00;
            po.companyId = companyId;
            const savedPO = await queryRunner.manager.save(po);

            const poItem = new PurchaseOrderItemEntity();
            poItem.purchaseOrderId = Number(savedPO.id);
            poItem.itemName = 'MacBook Pro M2';
            poItem.quantity = 1;
            poItem.unitPrice = 2500.00;
            poItem.totalPrice = 2500.00;
            await queryRunner.manager.save(poItem);

            // 14. Knowledge Base & Documents
            const kb = new KnowledgeArticleEntity();
            kb.title = 'Getting Started with AdminVault';
            kb.content = 'Welcome to the platform. Here is how you manage assets...';
            kb.category = KnowledgeCategoryEnum.TROUBLESHOOTING;
            kb.isPublished = true;
            kb.companyId = companyId;
            kb.authorId = adminUserId;
            await queryRunner.manager.save(kb);

            const doc = new DocumentEntity();
            doc.fileName = 'system_policy.pdf';
            doc.originalName = 'System Policy.pdf';
            doc.fileSize = 1024 * 500;
            doc.mimeType = 'application/pdf';
            doc.category = 'POLICY';
            doc.filePath = '/uploads/docs/system_policy.pdf';
            doc.uploadedBy = adminUserId;
            doc.companyId = companyId;
            await queryRunner.manager.save(doc);

            // 15. Licenses
            const lic = new CompanyLicenseEntity();
            lic.applicationId = Number(savedApp.id);
            lic.assignedDate = new Date();
            lic.expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
            lic.assignedEmployeeId = Number(savedEmp.id);
            lic.companyId = companyId;
            await queryRunner.manager.save(lic);

            // 16. Email Info & Vault
            const email = new EmailInfoEntity();
            email.email = 'it-support@adminvault.com';
            email.emailType = EmailTypeEnum.SUPPORT;
            email.companyId = companyId;
            await queryRunner.manager.save(email);

            const vault = new PasswordVaultEntity();
            vault.title = 'Root AWS Account';
            vault.username = 'root@adminvault.com';
            vault.encryptedPassword = 'secure_password_placeholder';
            vault.companyId = companyId;
            vault.createdBy = adminUserId;
            await queryRunner.manager.save(vault);

            // 17. Settings
            const setting = new SettingsEntity();
            setting.category = 'SYSTEM';
            setting.key = 'THEME';
            setting.value = 'DARK';
            setting.type = SettingType.SYSTEM;
            setting.companyId = companyId;
            await queryRunner.manager.save(setting);

            await queryRunner.commitTransaction();
            console.log('SEED: Completed successfully.');
            return { status: true, message: 'Total application seeding completed successfully.', code: 200 };

        } catch (err) {
            console.error('SEED ERROR:', err);
            await queryRunner.rollbackTransaction();
            return { status: false, message: `Seeding failed: ${err.message}`, code: 500 };
        } finally {
            await queryRunner.release();
        }
    }
}
