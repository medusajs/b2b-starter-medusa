import { ExclamationCircle } from "@medusajs/icons";
import { clx, Text } from "@medusajs/ui";
import { useTranslation } from "react-i18next";

type NoRecordsProps = {
  title?: string;
  message?: string;
  className?: string;
  buttonVariant?: string;
};

export const NoRecords = ({ title, message, className }: NoRecordsProps) => {
  const { t } = useTranslation();

  return (
    <div
      className={clx(
        "flex h-[400px] w-full flex-col items-center justify-center gap-y-4",
        className
      )}
    >
      <div className="flex flex-col items-center gap-y-3">
        <ExclamationCircle className="text-ui-fg-subtle" />

        <div className="flex flex-col items-center gap-y-1">
          <Text size="small" leading="compact" weight="plus">
            {title ?? t("general.noRecordsTitle")}
          </Text>

          <Text size="small" className="text-ui-fg-muted">
            {message ?? t("general.noRecordsMessage")}
          </Text>
        </div>
      </div>
    </div>
  );
};
