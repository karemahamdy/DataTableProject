<template>
    <v-card :key="renderKey" class="overflow-y-auto rounded-0 overflow-x-hidden" id="excelTable" color="transparent"
        :class="tableClasses" :loading="isLoading" flat>
        <v-row justify="space-between" align="center">
            <v-col v-if="isLoading && viewHeader" cols="auto" class="info--text font-weight-bold caption pe-5 px-5">
                <v-icon class="mdi-spin" size="14" color="info">mdi-loading</v-icon>
                {{ $t('please wait loading in progress') }}
            </v-col>
            <v-col cols="auto" v-if="exportImport">
                <v-btn class="rounded-0" depressed small color="success" @click="exportExcel">
                    <v-icon left>mdi-download</v-icon>
                    {{ $t('export excel') }}</v-btn>
                <v-btn class="rounded-0 overflow-hidden position-relative" outlined small color="success"
                    v-if="exportImport && tableHeader.some(({ readonly }) => !readonly)">
                    <v-icon left>mdi-upload</v-icon>
                    <input id="importFile" type="file" @change="importAsExcel" accept=".xlsx, .xls" />
                    {{ $t('import excel') }}</v-btn>

            </v-col>
            <v-col cols="auto">
                <v-btn v-if="exportImport" class="rounded-0" depressed small color="success" @click="exportExcel">
                    <v-icon left>mdi-download</v-icon>
                    {{ $t('export excel') }}</v-btn>
                <v-btn class="rounded-0 overflow-hidden position-relative" outlined small color="success"
                    v-if="exportImport && tableHeader.some(({ readonly }) => !readonly)">
                    <v-icon left>mdi-upload</v-icon>
                    <input id="importFile" type="file" @change="importAsExcel" accept=".xlsx, .xls" />
                    {{ $t('import excel') }}</v-btn>

            </v-col>
            <slot name="before" />
            <v-col v-if="add_new && checkDetailsValidation && viewHeader" cols="auto"
                class="gray9--text font-weight-bold caption pe-5 px-2">
                {{ $t('click') }} F3 {{ $t('to add new line') }}
            </v-col>
            <v-col v-if="!checkDetailsValidation && viewHeader" cols="auto" class="error--text font-weight-bold caption pe-5 px-2">
                {{ $t('fill required cells') }}
            </v-col>
        </v-row>
        <HotTable :settings="hotSettings" :data="jsonData" ref="hotTableComponent" />
        <div id="excelFooter" class="mt-n1" v-if="viewFooter">
            <HotTable :key="footerKey" :settings="hotFooterSettings"
                :data="customFooterCalculation ? [customFooterCalculation] : footerCalculation"
                ref="hotTableFooter"  />
        </div>
    </v-card>
</template>

<script>

import { HotTableMixins } from "../mixins/HotTableMixins";
import HotTable from "@handsontable/vue3";
export default {
    mixins: [HotTableMixins],
    data: () => ({}),
    props: {
        tableData: { type: Array, default: () => [] },
        groupHeader: { type: Array, default: () => [] },
        tableHeader: { type: Array, default: () => [] },
        rtl: { type: Boolean, default: false },
        cellLockups: { default: Function },
        onRowSelection: { default: Function },
        customCellStyle: { default: Function },
        detail: { type: Object, default: () => { } },
        requiredDetailKeys: { type: Array, default: () => [] },
        emptyRows: { default: 0 },
        add_new: { default: false },
        stretch: { default: true },
        filter: { default: true },
        keyDownWatch: { default: false },
        tableHeight: { default: "auto" },
        exportImport: { default: false },
        externalExport: { default: false },
        attachmentName: { default: null },
        viewFooter: { default: false },
        viewHeader: { default: true },
        customFooterCalculation: { default: null },
        disabledRows: { type: Array, default: () => [] },
    },
    mounted() { },
    watch: { tableData() { this.footerKey++ } },
    computed: {},
    methods: {},
    components: { HotTable },
};
</script>

<style lang="scss">
@import "../scss/hotTable.scss";
</style>
