import { GlobalResponse } from '@adminvault/backend-utils';
import { DeviceTypeEnum } from '../enums';

export class CreateDeviceModel {
    deviceType: DeviceTypeEnum;
    deviceName: string;
    model?: string;
    brandName?: string;
    servicesTag?: string;
    configuration?: string;

    constructor(
        deviceType: DeviceTypeEnum,
        deviceName: string,
        model?: string,
        brandName?: string,
        servicesTag?: string,
        configuration?: string
    ) {
        this.deviceType = deviceType;
        this.deviceName = deviceName;
        this.model = model;
        this.brandName = brandName;
        this.servicesTag = servicesTag;
        this.configuration = configuration;
    }
}

export class UpdateDeviceModel extends CreateDeviceModel {
    id: number;

    constructor(
        id: number,
        deviceType: DeviceTypeEnum,
        deviceName: string,
        model?: string,
        brandName?: string,
        servicesTag?: string,
        configuration?: string
    ) {
        super(deviceType, deviceName, model, brandName, servicesTag, configuration);
        this.id = id;
    }
}

export class DeleteDeviceModel {
    id: number;

    constructor(id: number) {
        this.id = id;
    }
}

export class GetDeviceModel {
    id: number;

    constructor(id: number) {
        this.id = id;
    }
}

export class DeviceResponseModel {
    id: number;
    deviceType: DeviceTypeEnum;
    deviceName: string;
    model?: string;
    brandName?: string;
    servicesTag?: string;
    configuration?: string;

    constructor(
        id: number,
        deviceType: DeviceTypeEnum,
        deviceName: string,
        model?: string,
        brandName?: string,
        servicesTag?: string,
        configuration?: string
    ) {
        this.id = id;
        this.deviceType = deviceType;
        this.deviceName = deviceName;
        this.model = model;
        this.brandName = brandName;
        this.servicesTag = servicesTag;
        this.configuration = configuration;
    }
}

export class GetAllDevicesModel extends GlobalResponse {
    devices: DeviceResponseModel[];

    constructor(status: boolean, code: number, message: string, devices: DeviceResponseModel[]) {
        super(status, code, message);
        this.devices = devices;
    }
}

export class GetDeviceByIdModel extends GlobalResponse {
    device: DeviceResponseModel;

    constructor(status: boolean, code: number, message: string, device: DeviceResponseModel) {
        super(status, code, message);
        this.device = device;
    }
}
