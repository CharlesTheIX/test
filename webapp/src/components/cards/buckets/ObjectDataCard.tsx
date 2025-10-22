import Document from "@/components/svgs/Document";
import { colors, default_null_label } from "@/globals";

type Props = {
  data: any;
};

const ObjectDataCard: React.FC<Props> = (props: Props) => {
  const { data } = props;
  const { size, metaData, lastModified, versionId, etag } = data;

  return (
    <div className="hyve-card">
      <div className="card-head">
        <Document primary_color={colors.white} />
        <p>Object Details</p>
      </div>

      <div className="card-body">
        <ul>
          <li>
            <p>
              <strong>size (KB):</strong> {size}
            </p>
          </li>

          <li>
            <p>
              <strong>content type:</strong> {metaData["content-type"]}
            </p>
          </li>

          <li>
            <p>
              <strong>uploaded from:</strong> {metaData["uploaded-from"]}
            </p>
          </li>

          <li>
            <p>
              <strong>last modified:</strong> {new Date(lastModified).toLocaleDateString()}
            </p>
          </li>

          <li>
            <p>
              <strong>version id:</strong> {versionId || default_null_label}
            </p>
          </li>

          <li>
            <p>
              <strong>etag:</strong> {etag}
            </p>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ObjectDataCard;
