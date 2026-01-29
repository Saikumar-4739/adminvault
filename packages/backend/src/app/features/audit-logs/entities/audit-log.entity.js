"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLog = void 0;
const tslib_1 = require("tslib");
const typeorm_1 = require("typeorm");
let AuditLog = (() => {
    let _classDecorators = [(0, typeorm_1.Entity)('audit_logs')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _action_decorators;
    let _action_initializers = [];
    let _action_extraInitializers = [];
    let _module_decorators;
    let _module_initializers = [];
    let _module_extraInitializers = [];
    let _performedBy_decorators;
    let _performedBy_initializers = [];
    let _performedBy_extraInitializers = [];
    let _details_decorators;
    let _details_initializers = [];
    let _details_extraInitializers = [];
    let _ipAddress_decorators;
    let _ipAddress_initializers = [];
    let _ipAddress_extraInitializers = [];
    let _userAgent_decorators;
    let _userAgent_initializers = [];
    let _userAgent_extraInitializers = [];
    let _timestamp_decorators;
    let _timestamp_initializers = [];
    let _timestamp_extraInitializers = [];
    var AuditLog = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
            _action_decorators = [(0, typeorm_1.Column)()];
            _module_decorators = [(0, typeorm_1.Column)()];
            _performedBy_decorators = [(0, typeorm_1.Column)()];
            _details_decorators = [(0, typeorm_1.Column)({ type: 'text', nullable: true })];
            _ipAddress_decorators = [(0, typeorm_1.Column)({ nullable: true })];
            _userAgent_decorators = [(0, typeorm_1.Column)({ nullable: true })];
            _timestamp_decorators = [(0, typeorm_1.CreateDateColumn)()];
            tslib_1.__esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
            tslib_1.__esDecorate(null, null, _action_decorators, { kind: "field", name: "action", static: false, private: false, access: { has: obj => "action" in obj, get: obj => obj.action, set: (obj, value) => { obj.action = value; } }, metadata: _metadata }, _action_initializers, _action_extraInitializers);
            tslib_1.__esDecorate(null, null, _module_decorators, { kind: "field", name: "module", static: false, private: false, access: { has: obj => "module" in obj, get: obj => obj.module, set: (obj, value) => { obj.module = value; } }, metadata: _metadata }, _module_initializers, _module_extraInitializers);
            tslib_1.__esDecorate(null, null, _performedBy_decorators, { kind: "field", name: "performedBy", static: false, private: false, access: { has: obj => "performedBy" in obj, get: obj => obj.performedBy, set: (obj, value) => { obj.performedBy = value; } }, metadata: _metadata }, _performedBy_initializers, _performedBy_extraInitializers);
            tslib_1.__esDecorate(null, null, _details_decorators, { kind: "field", name: "details", static: false, private: false, access: { has: obj => "details" in obj, get: obj => obj.details, set: (obj, value) => { obj.details = value; } }, metadata: _metadata }, _details_initializers, _details_extraInitializers);
            tslib_1.__esDecorate(null, null, _ipAddress_decorators, { kind: "field", name: "ipAddress", static: false, private: false, access: { has: obj => "ipAddress" in obj, get: obj => obj.ipAddress, set: (obj, value) => { obj.ipAddress = value; } }, metadata: _metadata }, _ipAddress_initializers, _ipAddress_extraInitializers);
            tslib_1.__esDecorate(null, null, _userAgent_decorators, { kind: "field", name: "userAgent", static: false, private: false, access: { has: obj => "userAgent" in obj, get: obj => obj.userAgent, set: (obj, value) => { obj.userAgent = value; } }, metadata: _metadata }, _userAgent_initializers, _userAgent_extraInitializers);
            tslib_1.__esDecorate(null, null, _timestamp_decorators, { kind: "field", name: "timestamp", static: false, private: false, access: { has: obj => "timestamp" in obj, get: obj => obj.timestamp, set: (obj, value) => { obj.timestamp = value; } }, metadata: _metadata }, _timestamp_initializers, _timestamp_extraInitializers);
            tslib_1.__esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AuditLog = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            tslib_1.__runInitializers(_classThis, _classExtraInitializers);
        }
        id = tslib_1.__runInitializers(this, _id_initializers, void 0);
        action = (tslib_1.__runInitializers(this, _id_extraInitializers), tslib_1.__runInitializers(this, _action_initializers, void 0));
        module = (tslib_1.__runInitializers(this, _action_extraInitializers), tslib_1.__runInitializers(this, _module_initializers, void 0));
        performedBy = (tslib_1.__runInitializers(this, _module_extraInitializers), tslib_1.__runInitializers(this, _performedBy_initializers, void 0));
        details = (tslib_1.__runInitializers(this, _performedBy_extraInitializers), tslib_1.__runInitializers(this, _details_initializers, void 0));
        ipAddress = (tslib_1.__runInitializers(this, _details_extraInitializers), tslib_1.__runInitializers(this, _ipAddress_initializers, void 0));
        userAgent = (tslib_1.__runInitializers(this, _ipAddress_extraInitializers), tslib_1.__runInitializers(this, _userAgent_initializers, void 0));
        timestamp = (tslib_1.__runInitializers(this, _userAgent_extraInitializers), tslib_1.__runInitializers(this, _timestamp_initializers, void 0));
        constructor() {
            tslib_1.__runInitializers(this, _timestamp_extraInitializers);
        }
    };
    return AuditLog = _classThis;
})();
exports.AuditLog = AuditLog;
//# sourceMappingURL=audit-log.entity.js.map