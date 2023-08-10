import DeviceInfo, {isEmulator} from 'react-native-device-info';

export class Device {
  UserId!: string;
  Model = DeviceInfo.getModel();
  SystemName = DeviceInfo.getSystemName();
  SystemVersion = DeviceInfo.getSystemVersion();
  UniqueId!: string;
  Manufacturer!: string;
  private constructor() {}

  public static CreateDeviceAsync = async (userId: string) => {
    let device = new Device();
    device.UserId = userId;
    await DeviceInfo.getManufacturer().then(mf => {
      device.Manufacturer = mf;
    });
    return device;
  };
}
