function AutoFormTooltip({ fieldConfigItem }: { fieldConfigItem: any }) {
  return (
    <>
      {fieldConfigItem?.description && (
        <p className="cm-text-sm cm-text-gray-500 dark:cm-text-white">
          {fieldConfigItem.description}
        </p>
      )}
    </>
  );
}

export default AutoFormTooltip;
