export default class BucketSizes {
  public static bucket_permissions: { [key: string]: number } = {
    "10GB": 10000000,
    "20GB": 20000000,
    "50GB": 50000000,
    "100GB": 100000000,
    "200GB": 200000000,
    "500GB": 500000000,
    "1TB": 1000000000,
    "2TB": 2000000000,
    "5TB": 5000000000,
  };

  public static getFlatBucketSizeOptions = (options: Option[], key: "value" | "label", slice?: [number, number]): any[] => {
    const res: any[] = [];
    options.forEach((o) => {
      if (!!o[key]) res.push(o[key]);
    });
    if (slice) return res.slice(...slice);
    return res;
  };

  public static getBucketSizeLabels = (values?: any[], slice?: [number, number]): string[] => {
    var res: string[] = [];
    Object.keys(this.bucket_permissions).forEach((label: string) => {
      if (!values) return res.push(label);
      if (values.length === 0) return;
      if (typeof values[0] === "number" && values.includes(this.bucket_permissions[label])) return res.push(label);
      if (this.getFlatBucketSizeOptions(values, "value").includes(this.bucket_permissions[label])) return res.push(label);
    });
    if (slice) return res.slice(...slice);
    return res;
  };

  public static getBucketSizeValues = (labels?: any[], slice?: [number, number]): number[] => {
    var res: number[] = [];
    Object.keys(this.bucket_permissions).forEach((key) => {
      const item: number = this.bucket_permissions[key];
      if (!labels) return res.push(item);
      if (labels.length === 0) return null;
      if (typeof labels[0] === "string" && labels.includes(key)) return res.push(item);
      if (this.getFlatBucketSizeOptions(labels, "label").includes(key)) return res.push(item);
    });
    if (slice) res = res.slice(...slice);
    return res as any;
  };

  public static getBucketSizeOptions = (items?: any[], slice?: [number, number]): Option[] => {
    const res: Option[] = [];
    Object.keys(this.bucket_permissions).forEach((key) => {
      const item: Option = { label: key, value: this.bucket_permissions[key] };
      if (!items) return res.push(item);
      if (items.length === 0) return;
      if (typeof items[0] === "string" && items.includes(key)) return res.push(item);
      if (this.getFlatBucketSizeOptions(items, "label").includes(key)) return res.push(item);
      if (typeof items[0] === "number" && items.includes(this.bucket_permissions[key])) return res.push(item);
    });
    if (slice) return res.slice(...slice);
    return res;
  };
}
