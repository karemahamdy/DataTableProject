import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.css';
import { arAR, registerLanguageDictionary } from 'handsontable/i18n';
import { ContextMenu } from 'handsontable/plugins/contextMenu';
registerAllModules();
registerLanguageDictionary(arAR);
import * as XLSX from 'xlsx';
export const HotTableMixins = {
  data: () => ({ footerKey: 1, renderKey: 1, isLoading: false }),
  computed: {
    hotSettings() {
      return {
        language: 'ar-AR',
        cells: this.cellRenderer,
        autoRowSize: false,
        autoColumnSize: false,
        height: this.tableHeight,
        autoWrapRow: true,
        autoWrapCol: true,
        autoInsertRow: false,
        enterMoves: { col: 1, row: 0 },
        rowHeaders: true,
        allowRemoveRow: true,
        colHeaders: this.tableHeader?.map(header => this.$t(header.text)),
        dataSchema: this.detail,
        columns: this.getColumns(),
        width: '100%',
        dropdownMenu: this.filter,
        filters: this.filter,
        stretchH: this.stretch ? 'all' : false,
        licenseKey: 'non-commercial-and-evaluation',
        afterChange: this.handleAfterChange,
        afterSelection: this.handleRowSelection,
        navigableHeaders: true,
        tabNavigation: true,
        nestedHeaders: this.buildNestedHeaders(),
        contextMenu: this.getContextMenuItems(),
        language: arAR.languageCode,
        persistentState: true,
        afterSelectionEnd: (r, c, r2, c2) => this.onRowSelection(r, c, r2, c2),
        beforeChange: (changes) => {
          for (let i = 0; i < changes.length; i++) {
            const [row] = changes[i];
            if (this.disabledRows.includes(row)) {
              return false;
            }
          }
          return true;
        }
      }
    },
  tableClasses() {
  let isRTL = this.rtl ? 'handsontable-rtl' : ''
  let customTable = this.tableHeader.some(({ customStyle }) => customStyle) ? 'customStyle' : ''
  return `${isRTL} ${customTable}`;
},
    jsonData() {
      if (this.tableData.length > 0) {
        return this.tableData;
      } else {
        let data = []
        if (this.detail) {
          if (Object.keys(this.detail)?.length) {
            for (let i = 0; i < +this.emptyRows; i++) {
              data.push({ ...this.detail });
            }
            this.$emit('json', data);
          }
        }
        return data;
      }
    },
    checkDetailsValidation() {
      let isValid = this.tableData.every((detail) => {
        return this.requiredDetailKeys?.every(key => {
          return Object.keys(detail).includes(key) && detail[key] !== null && detail[key] !== undefined;
        });
      })
      let detailsIsValid = this.requiredDetailKeys?.length ? isValid : true
      return detailsIsValid && !this.isLoading;
    },
    hotFooterSettings() {
      return {
        columns: this.getFooterColumns(),
        cells: (row, col, key) => {
          let cellProps = this.cellRenderer(row, col, key, true);
          if (['dropdown', 'asyncInput', 'date', 'time', 'checkbox', 'button', 'img'].includes(cellProps.type)) {
            cellProps.type = 'text';
          }
          return cellProps;
        },
        autoRowSize: false,
        autoColumnSize: false,
        height: 'auto',
        autoWrapRow: true,
        autoWrapCol: true,
        autoInsertRow: false,
        enterMoves: { col: 1, row: 0 },
        rowHeaders: true,
        Headers: true,
        allowRemoveRow: false,
        colHeaders: false,
        dataSchema: this.detail,
        width: '100%',
        filters: this.filter,
        stretchH: this.stretch ? 'all' : false,
        licenseKey: 'non-commercial-and-evaluation',
        language: arAR.languageCode,
      }
    },
    footerCalculation() {
      let total = { ...this.detail };
      this.tableHeader.forEach((header, index) => {
        if (!index && header.type !== 'float' && header.type !== 'number') {
          total[header.key] = this.$t('total');
        }
        if (['float', 'number'].includes(header.type)) {
          total[header.key] = this.tableData.reduce((sum, row) => sum + (+row[header.key] || 0), 0);
        }
      });
      return total;
    },
  },
  watch: {},
  mounted() {
    if (this.keyDownWatch || this.add_new) {
      document.addEventListener('keydown', this.handleKeyDown);
    }
    this.updateSettings()
  },
  methods: {
    updateSettings() {
      const hotInstance = this.$refs.hotTableComponent?.hotInstance;
      if (!hotInstance) return;

      hotInstance.updateSettings({
        beforeKeyDown: (event) => {
          const selection = hotInstance.getSelected();
          const [row, col] = selection?.[0] || [];
          const columnConfig = this.tableHeader?.[col];
          if (event.key === 'Enter' && columnConfig?.type === 'asyncInput') {
            const currentValue = hotInstance.getDataAtCell(row, col);
            this.validateAndResetAsyncInput(hotInstance, row, col, columnConfig, currentValue);
          }
          if (event.key === 'ArrowDown') {
            this.getFocusedColumn(selection?.[0]?.[0]);
          }
        }
      });
    },
    async validateAndResetAsyncInput(hotInstance, row, col, columnConfig, currentValue) {
      if (!currentValue) return;

      try {
        this.isLoading = true;
        const response = await this.$http.get(columnConfig.endpoint, {
          params: {
            search: currentValue,
            exact_match: true,
            ...(columnConfig.extraParams || {})
          }
        });
        this.isLoading = false;
        let data = columnConfig.listKey ? response.data?.data[columnConfig.listKey] : response.data?.data
        const isValid = data?.some(item =>
          (columnConfig.selectedValue ? item[columnConfig.selectedValue] : item.name) === currentValue
        );

        if (!isValid) {
          hotInstance.setDataAtCell(row, col, null);
          if (columnConfig.idKey) {
            const data = hotInstance.getSourceData();
            data[row][columnConfig.idKey] = null;
            this.$emit('json', [...data]);
          }
          this.$global.ShowSnack('warning', this.$t('Invalid selection - value reset'));
        }
      } catch (error) {
        this.$global.ShowSnack('error', this.$t('Validation failed'));
      }
    },
    getContextMenuItems() {
      return {
        items: this.add_new ? {
          row_above: { name: this.$t('add line') },
          row_below: {},
          separator: ContextMenu.SEPARATOR,
          clear_custom: {
            name: this.$t('clear all'),
            callback() { this.clear() }
          }
        } : false
      }
    },
    buildNestedHeaders() {
      if (!this.groupHeader?.length) return false;
      return [
        this.groupHeader.map(header => ({ label: this.$t(header.text), ...header })),
        this.tableHeader?.map(header => this.$t(header.text))
      ];
    },
    mapColumnType(type) {
      return type === 'float' || type === 'number' ? 'numeric' :
        type === 'boolean' ? 'checkbox' :
          type === 'asyncInput' ? 'autocomplete' :
            type;
    },
    getColumnOptions(header, type) {
      const options = {};
      if (header.type === 'dropdown') {
        options.source = header.lockups?.map(lockup => header.selectedValue ? lockup[header.selectedValue] : lockup.name) || [];
        options.trimDropdown = true;
        options.type = 'autocomplete';
      }
      if (['numeric', 'float', 'number'].includes(header.type)) {
        options.numericFormat = { pattern: header.type === 'number' ? '0' : '0,0.00' };
      }
      if (header.type === 'time') {
        options.timeFormat = header.timeFormat || 'HH:mm';
        options.correctFormat = header.correctFormat ?? true;
      }
      if (header.type === 'date') {
        options.dateFormat = header.dateFormat || 'YYYY-MM-DD';
      }
      if (['button', 'img'].includes(header.type) && !type) {
        options.type = 'text'
        options.readOnly = true
      }
      if (type && ['dropdown', 'date', 'time', 'checkbox', 'button', 'img'].includes(header.type)) {
        options.type = 'text'
      }
      if (header.type === 'asyncInput') {
        options.type = 'autocomplete';
        options.strict = true;
        options.filter = true;
        options.trimDropdown = false;
        options.source = async (query, process) => {
          try {
            const results = await this.fetchAsyncOptions(header.endpoint, query, header);
            process(results);
          } catch (error) {
            process([]);
          }
        };
      }
      return options;
    },
    async fetchAsyncOptions(endpoint, query, header) {
      if (!query || query.length < (header.minQueryLength || 2)) {
        return [];
      }

      try {
        this.isLoading = true;
        const response = await this.$http.get(endpoint, {
          params: {
            word: query,
            ...(header.extraParams || {})
          }
        });
        this.isLoading = false;
        let data = header.listKey ? response.data?.data[header.listKey] : response.data?.data
        return data?.map(item =>
          header.selectedValue ? item[header.selectedValue] : item.name
        )
      } catch (error) {
        return [];
      }
    },
    getColumns() {
      return this.tableHeader?.map(header => ({
        data: header.key,
        width: header.width,
        readOnly: (Object.keys(this.detail || {})?.length ? header.readOnly || header.readonly || header.disabled : true),
        type: this.mapColumnType(header.type),
        ...this.getColumnOptions(header, false)
      }));
    },
    getFooterColumns() {
      return this.tableHeader?.map(header => ({
        data: header.key,
        width: header.width,
        readOnly: true,
        type: this.mapColumnType(header.type),
        ...this.getColumnOptions(header, true)
      }));
    },
    handleAfterChange(changes, source) {
      if (!changes) return;
      const updatedData = [...this.jsonData];
      changes.forEach(async ([row, col, oldValue, newValue]) => {


        const columnConfig = this.tableHeader.find(({ key }) => key == col);
        if (!columnConfig || !this.jsonData[row]) return;

        if (columnConfig.type === 'dropdown') {
          this.handleDropdownUpdate(updatedData, row, col, columnConfig, newValue);
        } else if (columnConfig.type === 'asyncInput') {
          if (newValue !== oldValue) {
            await this.handleAsyncInputUpdate(updatedData, row, col, columnConfig, newValue);
          }
        }
        else {
          updatedData[row][col] = newValue;
        }
        if (!this.validateColumnValue(updatedData, row, col, newValue, columnConfig)) {
          return;
        }
        if (source === 'edit') {
          this.$emit('cell', { row, col, oldValue, newValue, columnConfig });
        }
      });

      this.$emit('json', updatedData);
    },
    async handleAsyncInputUpdate(updatedData, row, col, columnConfig, newValue) {
      if (!newValue) {
        updatedData[row][col] = null;
        if (columnConfig.idKey) {
          updatedData[row][columnConfig.idKey] = null;
        }
        return;
      }

      try {
        this.isLoading = true;
        const response = await this.$http.get(columnConfig.endpoint, {
          params: {
            word: newValue,
            exact_match: true,
            ...(columnConfig.extraParams || {})
          }
        });
        this.isLoading = false;
        let data = columnConfig.listKey ? response.data?.data[columnConfig.listKey] : response.data?.data
        const selectedItem = data?.find(item =>
          (columnConfig.selectedValue ? item[columnConfig.selectedValue] : item.name) === newValue
        );

        if (selectedItem) {
          updatedData[row][col] = newValue;
          if (columnConfig.idKey) {
            updatedData[row][columnConfig.idKey] = selectedItem[columnConfig.selectedProp || 'id'];
          }
        } else {
          updatedData[row][col] = null;
          if (columnConfig.idKey) {
            updatedData[row][columnConfig.idKey] = null;
          }
        }
        this.$emit('json', [...this.jsonData]);
      } catch (error) {
        updatedData[row][col] = null;
        if (columnConfig.idKey) {
          updatedData[row][columnConfig.idKey] = null;
        }
      }
    },
    handleDropdownUpdate(updatedData, row, col, columnConfig, newValue) {
      let selectedItem = null;

      if (columnConfig.lockups) {
        selectedItem = columnConfig.lockups.find(item =>
          (columnConfig.selectedValue ? item[columnConfig.selectedValue]?.trim() : item.name?.trim()) === newValue?.trim()
        );
      } else {
        const colIndex = this.tableHeader.findIndex(({ key }) => key === col);
        const lockups = this.cellLockups(this.jsonData[row], row, colIndex, columnConfig.key, columnConfig);
        selectedItem = lockups?.find(item =>
          (columnConfig.selectedValue ? item[columnConfig.selectedValue] : item.name)?.trim() === newValue?.trim()
        );
      }
      updatedData[row][columnConfig.idKey || `${columnConfig.key}_id`] = selectedItem ? selectedItem[columnConfig?.selectedProp || 'id'] : null;
      updatedData[row][col] = selectedItem ? newValue : null;
    },
    validateColumnValue(updatedData, row, col, newValue, columnConfig) {
      if (['numeric', 'float', 'number'].includes(columnConfig.type)) {
        if (isNaN(newValue) || typeof newValue !== 'number') {
          this.showValidationWarning(columnConfig.text, row, 'Expected a numeric value');
          updatedData[row][col] = null;
          return false;
        }
      }
      if (columnConfig.type === 'time') {
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(newValue)) {
          this.showValidationWarning(columnConfig.text, row, 'Expected a time value');
          updatedData[row][col] = null;
          return false;
        }
      }
      return true;
    },
    showValidationWarning(columnText, row, message) {
      this.$global.ShowSnack('warning', message, `${this.$t('Invalid value for column')} '${this.$t(columnText)}', ${this.$t('line')} ${this.$t('number')} : ${row + 1}`);
    },
    cellRenderer(row, col, key, isFooter = false) {
      const cellProperties = {};
      const columnConfig = this.tableHeader[col];
      if (columnConfig && this.jsonData[row]) {
        cellProperties.type = columnConfig.type;
        if (columnConfig.type === 'button' && !isFooter) {
          cellProperties.type = 'text'
          cellProperties.renderer = (instance, td, row, col, prop, value) => {
            td.innerHTML = "";
            td.appendChild(this.buttonRender(instance, td, row, col, prop, value));
          };
        }
        if (columnConfig.type === 'img' && !isFooter) {
          cellProperties.type = 'text'
          cellProperties.renderer = (instance, td, row, col, prop, value) => {
            td.appendChild(this.imgRender(instance, td, row, col, prop, value));
          };
        }
        if (columnConfig.type === 'boolean') {
          cellProperties.renderer = (instance, td, row, col, prop, value) => {
            td.style.backgroundColor = value ? 'var(--success)' : 'var(--error)';
            td.style.color = '#FFF';
            td.textContent = value ? this.$t('yes') : this.$t('no');
          };
          cellProperties.readOnly = true;
          cellProperties.type = 'checkbox'
        }
        if (columnConfig.customStyle) {
          cellProperties.renderer = (instance, td, row, col, prop, value) => {
            let custom = this.customCellStyle(instance, td, row, col, prop, value, columnConfig)
            td.style.backgroundColor = custom.style.backgroundColor;
            td.style.color = custom.style.color;
            td.style.fontWeight = custom.style.fontWeight;
            td.textContent = custom.textContent;
          };
        }
        if (columnConfig.type === 'dropdown') {
          if (this.tableHeader[col]?.lockups) {
            cellProperties.source = this.tableHeader[col].lockups?.map(lockup => this.tableHeader[col].selectedValue ? lockup[this.tableHeader[col].selectedValue] : lockup.name);
          } else {
            cellProperties.source = this.cellLockups(this.jsonData[row], row, col, key, columnConfig)?.map((lockup) =>
              this.tableHeader[col]?.selectedValue ? lockup[this.tableHeader[col]?.selectedValue] : lockup.name)
          }
        }
        if (columnConfig.type === 'asyncInput' && !isFooter) {
          cellProperties.type = 'autocomplete';
          cellProperties.source = async (query, process) => {
            try {
              const results = await this.fetchAsyncOptions(columnConfig.endpoint, query, columnConfig);
              process(results);
            } catch (error) {
              process([]);
            }
          };
          cellProperties.strict = false;
          cellProperties.filter = false;
          cellProperties.visibleRows = 5;
          cellProperties.trimDropdown = false;
        }

        if (columnConfig.type === 'float' || columnConfig.type === 'number' || columnConfig.type === 'price') {
          cellProperties.type = 'numeric'
          cellProperties.numericFormat = columnConfig.type === 'number' ? { pattern: '0' } : { pattern: '0,0.00' }
        }
        if (columnConfig.type === 'time') {
          cellProperties.type = 'time';
          cellProperties.timeFormat = columnConfig.timeFormat || 'HH:mm';
          cellProperties.correctFormat = columnConfig.correctFormat || true;
        }
      }
      if (this.disabledRows.includes(row) || this.jsonData[row]?.disabled) {
        cellProperties.readOnly = true
      }
      if (this.jsonData[row]?.classes) {
        cellProperties.className = this.jsonData[row]?.classes
      }
      return cellProperties;
    },
    handleKeyDown(event) {
      this.$emit('keyPress', event.key);
      switch (event.key) {
        case 'F3': this.addNewRow(); break;
        default: break;
      }
    },
    handleButtonClick(row, col, prop, value) {
      this.$emit('buttonClick', { data: this.jsonData[row], row, col, prop, value });
    },
    getFocusedColumn() {
      const hotInstance = this.$refs.hotTableComponent.hotInstance;
      if (hotInstance) {
        const selected = hotInstance.getSelected();
        if (selected && selected.length > 0) {
          const [startRow, startCol, endRow, endCol] = selected[0];
          if (endRow === this.tableData.length - 1 && this.add_new) {
            this.addNewRow(startCol);
          }
          return { startRow, startCol, endRow, endCol };
        }
      }
      return null;
    },
    addNewRow(focusOn = 0) {
      if (this.detail && this.checkDetailsValidation) {
        if (this.add_new && Object.keys(this.detail)?.length) {
          const newData = [...this.tableData, { ...this.detail }];
          this.$emit('json', newData);

          const hotInstance = this.$refs.hotTableComponent.hotInstance;
          if (hotInstance) {
            hotInstance.loadData(newData);
          }
          this.$nextTick(() => {
            const hotInstance = this.$refs.hotTableComponent.hotInstance;
            if (hotInstance) {
              const newRowIndex = this.tableData.length - 1;
              hotInstance.selectCell(newRowIndex, focusOn);
            }
          });
        }
      }
    },
    handleRowSelection(row) {
      this.$emit('selectedRow', this.tableData[row]);
    },
    removeRow() {
      this.$nextTick(() => {
        const hotInstance = this.$refs.hotTableComponent.hotInstance;
        const [row] = hotInstance.getSelectedLast();
        if (this.tableData.length > 1) {
          hotInstance.alter('remove_row', row, 1);
          this.nextTick(() => {
            this.$emit('json', this.tableData);
          })
          hotInstance.render();
        }
      })
    },
    exportExcel() {
      const hotInstance = this.$refs.hotTableComponent.hotInstance;
      hotInstance.getPlugin('exportFile').downloadFile('csv', {
        bom: true,
        columnDelimiter: ',',
        columnHeaders: true,
        exportHiddenColumns: true,
        exportHiddenRows: true,
        fileExtension: 'xlsx',
        filename: `${this.attachmentName || this.$store.state.activeScreen.sub_title}_[YYYY]-[MM]-[DD]`,
        mimeType: 'text/xlsx',
        rowDelimiter: '\r\n',
        rowHeaders: false,
      });
    },
    importAsExcel(event) {
      const hotInstance = this.$refs.hotTableComponent.hotInstance;
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        let newData = []
        const importedData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        importedData.forEach((row, rowIndex) => {
          if (rowIndex) {
            let obj = { ...this.detail }
            this.tableHeader.forEach((header, headerIndex) => {
              obj[header.key] = row[headerIndex] || (header.type == 'float' || header.type == 'number' ? 0 : null);
              if (header?.type === 'dropdown') {
                if (header.lockups) {
                  const selectedItem = header?.lockups?.find(item =>
                    (header.selectedValue ? item[header.selectedValue]?.trim() : item.name?.trim()) === row[headerIndex]?.trim()
                  );
                  obj[header.idKey || `${header.key}_id`] = selectedItem ? selectedItem[header?.selectedProp || 'id'] : null;
                }
                else {
                  let lockups = this.cellLockups(obj, rowIndex, headerIndex, header.key, header)
                  const selectedItem = lockups?.find(item =>
                    (header.selectedValue ? item[header.selectedValue] : item.name)?.trim() === row[headerIndex]?.trim()
                  );
                  obj[header.idKey || `${header.key}_id`] = selectedItem ? selectedItem[header?.selectedProp || 'id'] : null;
                }
              }
            });
            newData.push(obj);
          }
        });
        if (this.externalExport) {
          this.$emit('import', newData);
        } else {
          hotInstance.loadData(newData);
          this.$emit('json', newData);
        }

      };
      reader.readAsArrayBuffer(file);
    },
    selectCell(newRowIndex = 0, focusOn = 0) {
      const hotInstance = this.$refs.hotTableComponent.hotInstance;
      hotInstance.selectCell(newRowIndex, focusOn);
    },
    render() {
      this.renderKey++;
    },
    buttonRender(instance, td, row, col, prop, value) {
      let head = this.tableHeader[col];
      const button = document.createElement('button');
      button.innerText = value || this.$t(head.buttonLabel || head.text);
      button.style.width = '100%';
      button.style.height = head.buttonHeight || '100%';
      button.style.cursor = 'pointer';
      button.style.border = '0px';
      button.tabindex = "-1"
      button.style.background = head.buttonBackground || '#fff';
      button.style.color = head.buttonColor || '#000';
      button.addEventListener('click', () => {
        this.handleButtonClick(row, col, prop, value);
      });
      return button
    },
    imgRender(instance, td, row, col, prop, value) {
      let head = this.tableHeader[col];
      const img = document.createElement('img');
      img.src = value ? process.env.VUE_APP_SERVER + value : require('@/assets/img/png/files/default.jpg');
      img.height = head.imgHeight || 60;
      img.width = head.imgWidth || 60;
      img.style.display = 'block';
      img.style.margin = 'auto';
      img.addEventListener('click', (event) => {
        event.preventDefault();
        this.$emit('imgClick', { data: this.jsonData[row], row, col, prop, value });
      });
      td.innerText = '';
      return img
    },
  },
  beforeDestroy() {
    if (this.keyDownWatch || this.add_new) {
      document.removeEventListener('keydown', this.handleKeyDown);
    }
  },
  afterScrollVertically: () => {
  this.$emit('afterScroll')
},
};
