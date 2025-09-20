<template>
    <div>
        <div class="flex items-center justify-between mb-6">
            <h1 class="text-2xl font-bold text-black dark:text-white">จัดการธุรกรรม</h1>
        </div>

        <!-- Filters -->
        <div class="panel mb-6">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <!-- Search -->
                <div>
                    <label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">ค้นหา</label>
                    <input v-model="searchTerm" type="text" placeholder="ค้นหารหัสธุรกรรม ผู้ใช้" class="form-input" />
                </div>

                <!-- Status Filter -->
                <div>
                    <label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">สถานะ</label>
                    <CustomDropdown v-model="statusFilter" :options="statusOptions" placeholder="ทั้งหมด" />
                </div>

                <!-- Type Filter -->
                <div>
                    <label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">ประเภท</label>
                    <CustomDropdown v-model="typeFilter" :options="typeOptions" placeholder="ทั้งหมด" />
                </div>

                <!-- Actions -->
                <div class="flex items-end">
                    <button @click="resetFilters" class="btn btn-outline-primary w-full">รีเซ็ตตัวกรอง</button>
                </div>
            </div>
        </div>

        <!-- Transactions Table -->
        <div v-if="!loading" class="panel">
            <DataTable :items="filteredTransactions" :columns="tableColumns" :pageSize="10" :showPagination="true" idKey="id">
                <template #transaction="{ row }">
                    <div class="flex items-center gap-3">
                        <div
                            class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center font-medium"
                        >
                            {{ row.transaction_type?.charAt(0).toUpperCase() || 'T' }}
                        </div>
                        <div>
                            <button 
                                @click="viewTransactionDetails(row)"
                                class="font-mono text-sm font-medium text-primary hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer underline hover:no-underline"
                                :title="'คลิกเพื่อดูรายละเอียดธุรกรรม'"
                            >
                                {{ row.order_reference || 'N/A' }}
                            </button>
                            <div class="text-xs text-gray-500 dark:text-gray-400">{{ formatShortId(row.id) }}</div>
                        </div>
                    </div>
                </template>

                <template #type="{ row }">
                    <span
                        :class="
                            row.transaction_type === 'buy'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        "
                        class="px-2 py-1 text-xs rounded-full inline-flex items-center"
                    >
                        {{ row.transaction_type === 'buy' ? 'ซื้อ' : 'ขาย' }}
                    </span>
                </template>

                <template #user="{ row }">
                    <div>
                        <div class="font-medium">{{ row.user_name || 'ไม่ระบุ' }}</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">{{ formatShortId(row.user_id) }}</div>
                    </div>
                </template>

                <template #amount="{ row }">
                    <div>
                        <div class="font-medium">{{ formatCurrency(row.from_amount) }} {{ row.from_currency }}</div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">→ {{ formatCurrency(row.to_amount) }} {{ row.to_currency }}</div>
                        <div class="text-xs text-gray-400">@ {{ formatCurrency(row.exchange_rate) }}</div>
                    </div>
                </template>

                <template #network="{ row }">
                    <span class="px-2 py-1 text-xs bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 rounded">
                        {{ row.selected_network }}
                    </span>
                </template>

                <template #status="{ row }">
                    <span :class="getStatusClasses(row.status)" class="px-2 py-1 text-xs rounded-full inline-flex items-center">
                        <span class="w-1.5 h-1.5 rounded-full mr-1" :class="getStatusDotClass(row.status)"></span>
                        {{ getStatusText(row.status) }}
                    </span>
                </template>

                <template #created_at="{ row }">
                    <div class="text-sm">{{ formatDate(row.created_at) }}</div>
                </template>

                <template #files="{ row }">
                    <div class="flex items-center justify-start space-x-2">
                        <!-- Payment Slips from array -->
                        <template v-if="row.payment_slips && row.payment_slips.length > 0">
                            <button
                                v-for="(slip, index) in row.payment_slips.slice(0, 3)"
                                :key="index"
                                @click="viewImage(slip.url, `หลักฐานการโอน ${index + 1}`)"
                                class="inline-flex items-center justify-center w-6 h-6 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                :title="`ดูหลักฐานการโอน ${index + 1}: ${slip.file_name}`"
                            >
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fill-rule="evenodd"
                                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm8 6a2 2 0 11-4 0 2 2 0 014 0zm-2 4a4 4 0 00-3.464 2H16a1 1 0 001-1.53A4 4 0 0012 13z"
                                    />
                                </svg>
                            </button>
                            <span
                                v-if="row.payment_slips.length > 3"
                                class="text-xs text-gray-500 dark:text-gray-400"
                                :title="`มีไฟล์อีก ${row.payment_slips.length - 3} ไฟล์`"
                            >
                                +{{ row.payment_slips.length - 3 }}
                            </span>
                        </template>

                        <!-- Fallback to old payment_slip_url -->
                        <button
                            v-else-if="row.payment_slip_url"
                            @click="viewImage(row.payment_slip_url, 'หลักฐานการโอน')"
                            class="inline-flex items-center justify-center w-6 h-6 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                            title="ดูหลักฐานการโอน"
                        >
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    fill-rule="evenodd"
                                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm8 6a2 2 0 11-4 0 2 2 0 014 0zm-2 4a4 4 0 00-3.464 2H16a1 1 0 001-1.53A4 4 0 0012 13z"
                                />
                            </svg>
                        </button>

                        <!-- TXID Screenshot -->
                        <button
                            v-if="row.txid_screenshot_url"
                            @click="viewImage(row.txid_screenshot_url, 'TXID Screenshot')"
                            class="inline-flex items-center justify-center w-6 h-6 text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                            title="ดู TXID Screenshot"
                        >
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm8 6a2 2 0 11-4 0 2 2 0 014 0zm-2 4a4 4 0 00-3.464 2H16a1 1 0 001-1.53A4 4 0 0012 13z"
                                />
                            </svg>
                        </button>

                        <!-- No files indicator -->
                        <span
                            v-if="(!row.payment_slips || row.payment_slips.length === 0) && !row.payment_slip_url && !row.txid_screenshot_url"
                            class="text-gray-400 text-xs"
                            >-</span
                        >
                    </div>
                </template>

                <template #actions="{ row }">
                    <div class="flex items-center justify-start space-x-2">
                        <!-- View Details -->
                        <button
                            @click="viewTransactionDetails(row)"
                            class="inline-flex items-center justify-center w-6 h-6 text-gray-500 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-blue-500 rounded transition-colors"
                            title="ดูรายละเอียด"
                        >
                            <icon-eye class="w-4 h-4" />
                        </button>

                        <!-- Update Status -->
                        <button
                            v-if="canUpdateStatus(row.status)"
                            @click="showStatusModal(row)"
                            class="inline-flex items-center justify-center w-6 h-6 text-gray-500 hover:bg-gray-100 hover:text-orange-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-orange-500 rounded transition-colors"
                            title="อัพเดทสถานะ"
                        >
                            <icon-edit class="w-4 h-4" />
                        </button>
                    </div>
                </template>
            </DataTable>
        </div>

        <!-- Loading State -->
        <div
            v-if="loading"
            class="flex items-center justify-center p-8 rounded-md bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-700"
        >
            <div class="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500"></div>
            <span class="ml-3 text-sm text-gray-600 dark:text-gray-400">กำลังโหลดข้อมูล...</span>
        </div>

        <!-- Empty State -->
        <div
            v-if="!loading && filteredTransactions.length === 0"
            class="text-center p-8 rounded-md bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-700"
        >
            <div class="inline-flex items-center justify-center p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                <svg class="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                </svg>
            </div>
            <p class="text-gray-500 dark:text-gray-400">ไม่พบข้อมูลธุรกรรม</p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">ลองปรับเปลี่ยนตัวกรองหรือช่วงเวลา</p>
        </div>

        <!-- Transaction Detail Modal -->
        <div v-if="showDetailModal" class="fixed inset-0 z-50 overflow-y-auto">
            <div class="flex items-center justify-center min-h-screen px-4">
                <div class="fixed inset-0 bg-black opacity-50" @click="closeDetailModal"></div>
                <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl z-10">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-xl font-semibold">รายละเอียดธุรกรรม</h3>
                        <button @click="closeDetailModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>

                    <div v-if="selectedTransaction" class="space-y-6">
                        <!-- Transaction Header -->
                        <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                            <div class="flex items-center gap-4">
                                <div
                                    class="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center font-medium text-lg"
                                >
                                    {{ selectedTransaction.transaction_type?.charAt(0).toUpperCase() || 'T' }}
                                </div>
                                <div>
                                    <h4 class="text-lg font-semibold">{{ selectedTransaction.order_reference || 'N/A' }}</h4>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">ID: {{ formatShortId(selectedTransaction.id) }}</p>
                                    <div class="mt-1">
                                        <span
                                            :class="getStatusClasses(selectedTransaction.status)"
                                            class="px-2 py-1 text-xs rounded-full inline-flex items-center"
                                        >
                                            <span class="w-1.5 h-1.5 rounded-full mr-1" :class="getStatusDotClass(selectedTransaction.status)"></span>
                                            {{ getStatusText(selectedTransaction.status) }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Transaction Details -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Basic Info -->
                            <div class="space-y-4">
                                <h5 class="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">ข้อมูลพื้นฐาน</h5>

                                <div>
                                    <label class="text-sm text-gray-600 dark:text-gray-400 block mb-1">ประเภทธุรกรรม</label>
                                    <span
                                        :class="
                                            selectedTransaction.transaction_type === 'buy'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                        "
                                        class="px-2 py-1 text-sm rounded-full inline-flex items-center"
                                    >
                                        {{ selectedTransaction.transaction_type === 'buy' ? 'ซื้อ USDT' : 'ขาย USDT' }}
                                    </span>
                                </div>

                                <div>
                                    <label class="text-sm text-gray-600 dark:text-gray-400 block mb-1">ผู้ใช้</label>
                                    <p class="font-medium">{{ selectedTransaction.user_name || 'ไม่ระบุ' }}</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">ID: {{ formatShortId(selectedTransaction.user_id) }}</p>
                                </div>

                                <div>
                                    <label class="text-sm text-gray-600 dark:text-gray-400 block mb-1">เครือข่าย</label>
                                    <span class="px-2 py-1 text-sm bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 rounded">
                                        {{ selectedTransaction.selected_network }}
                                    </span>
                                </div>

                                <div>
                                    <label class="text-sm text-gray-600 dark:text-gray-400 block mb-1">วันที่สร้าง</label>
                                    <p class="font-medium">{{ formatDate(selectedTransaction.created_at) }}</p>
                                </div>

                                <div v-if="selectedTransaction.updated_at_th || selectedTransaction.updated_at">
                                    <label class="text-sm text-gray-600 dark:text-gray-400 block mb-1">วันที่อัพเดท</label>
                                    <p class="font-medium">{{ formatDate(selectedTransaction.updated_at_th || selectedTransaction.updated_at) }}</p>
                                </div>
                            </div>

                            <!-- Amount Details -->
                            <div class="space-y-4">
                                <h5 class="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                                    รายละเอียดจำนวนเงิน
                                </h5>

                                <div>
                                    <label class="text-sm text-gray-600 dark:text-gray-400 block mb-1">จำนวนเงินต้นทาง</label>
                                    <p class="font-semibold text-lg">
                                        {{ formatCurrency(selectedTransaction.from_amount) }} {{ selectedTransaction.from_currency }}
                                    </p>
                                </div>

                                <div>
                                    <label class="text-sm text-gray-600 dark:text-gray-400 block mb-1">จำนวนเงินปลายทาง</label>
                                    <p class="font-semibold text-lg">
                                        {{ formatCurrency(selectedTransaction.to_amount) }} {{ selectedTransaction.to_currency }}
                                    </p>
                                </div>

                                <div>
                                    <label class="text-sm text-gray-600 dark:text-gray-400 block mb-1">อัตราแลกเปลี่ยน</label>
                                    <p class="font-medium">{{ formatCurrency(selectedTransaction.exchange_rate) }}</p>
                                </div>

                                <div v-if="selectedTransaction.recipient_wallet_address && selectedTransaction.transaction_type === 'buy'">
                                    <label class="text-sm text-gray-600 dark:text-gray-400 block mb-1">
                                        {{ selectedTransaction.transaction_type === 'buy' ? 'Wallet Address ปลายทาง' : 'Customer Wallet Address' }}
                                    </label>
                                    <p class="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded break-all">
                                        {{ selectedTransaction.recipient_wallet_address }}
                                    </p>
                                </div>

                                <div v-if="selectedTransaction.usdt_from_wallet_address && selectedTransaction.transaction_type === 'sell'">
                                    <label class="text-sm text-gray-600 dark:text-gray-400 block mb-1">กระเป๋าที่รับเงิน USDT</label>
                                    <p class="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded break-all">
                                        {{ selectedTransaction.usdt_from_wallet_address }}
                                    </p>
                                </div>

                                <div v-if="selectedTransaction.usdt_transfer_hash">
                                    <label class="text-sm text-gray-600 dark:text-gray-400 block mb-1">TXID</label>
                                    <p class="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded break-all">
                                        {{ selectedTransaction.usdt_transfer_hash }}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Admin Information -->
                        <div v-if="selectedTransaction.admin_info" class="space-y-4">
                            <h5 class="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                                ข้อมูลแอดมินที่ลูกค้าซื้อ / ขาย
                            </h5>

                            <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <!-- Admin Type -->
                                    <div>
                                        <label class="text-sm text-blue-600 dark:text-blue-400 block mb-1">ประเภท</label>
                                        <span
                                            :class="
                                                selectedTransaction.admin_info.type === 'bank'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                                            "
                                            class="px-2 py-1 text-sm rounded-full inline-flex items-center"
                                        >
                                            {{ selectedTransaction.admin_info.type === 'bank' ? 'บัญชีธนาคาร' : 'กระเป๋าเงินดิจิทัล' }}
                                        </span>
                                    </div>

                                    <!-- Admin ID -->
                                    <div>
                                        <label class="text-sm text-blue-600 dark:text-blue-400 block mb-1">ID</label>
                                        <p class="font-medium text-blue-800 dark:text-blue-200">{{ selectedTransaction.admin_info.id }}</p>
                                    </div>

                                    <!-- Bank specific info -->
                                    <template v-if="selectedTransaction.admin_info.type === 'bank'">
                                        <div v-if="selectedTransaction.admin_info.bank_name">
                                            <label class="text-sm text-blue-600 dark:text-blue-400 block mb-1">ธนาคาร</label>
                                            <p class="font-medium text-blue-800 dark:text-blue-200">{{ selectedTransaction.admin_info.bank_name }}</p>
                                        </div>

                                        <div v-if="selectedTransaction.admin_info.account_number">
                                            <label class="text-sm text-blue-600 dark:text-blue-400 block mb-1">เลขที่บัญชี</label>
                                            <p class="font-mono text-sm bg-blue-100 dark:bg-blue-800 p-2 rounded text-blue-800 dark:text-blue-200">
                                                {{ selectedTransaction.admin_info.account_number }}
                                            </p>
                                        </div>

                                        <div v-if="selectedTransaction.admin_info.account_name">
                                            <label class="text-sm text-blue-600 dark:text-blue-400 block mb-1">ชื่อบัญชี</label>
                                            <p class="font-medium text-blue-800 dark:text-blue-200">{{ selectedTransaction.admin_info.account_name }}</p>
                                        </div>
                                    </template>

                                    <!-- Wallet specific info -->
                                    <template v-if="selectedTransaction.admin_info.type === 'wallet'">
                                        <div v-if="selectedTransaction.admin_info.network">
                                            <label class="text-sm text-blue-600 dark:text-blue-400 block mb-1">เครือข่าย</label>
                                            <span class="px-2 py-1 text-sm bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200 rounded">
                                                {{ selectedTransaction.admin_info.network }}
                                            </span>
                                        </div>

                                        <div v-if="selectedTransaction.admin_info.wallet_name">
                                            <label class="text-sm text-blue-600 dark:text-blue-400 block mb-1">ชื่อกระเป๋า</label>
                                            <p class="font-medium text-blue-800 dark:text-blue-200">{{ selectedTransaction.admin_info.wallet_name }}</p>
                                        </div>

                                        <div v-if="selectedTransaction.admin_info.wallet_address" class="md:col-span-2">
                                            <label class="text-sm text-blue-600 dark:text-blue-400 block mb-1">ที่อยู่กระเป๋า</label>
                                            <p class="font-mono text-sm bg-blue-100 dark:bg-blue-800 p-2 rounded break-all text-blue-800 dark:text-blue-200">
                                                {{ selectedTransaction.admin_info.wallet_address }}
                                            </p>
                                        </div>
                                    </template>

                                    <!-- QR Code -->
                                    <div v-if="selectedTransaction.admin_info.qr_code_url" class="md:col-span-2">
                                        <label class="text-sm text-blue-600 dark:text-blue-400 block mb-2">QR Code</label>
                                        <div class="flex justify-center">
                                            <img
                                                :src="selectedTransaction.admin_info.qr_code_url"
                                                alt="QR Code"
                                                class="w-32 h-32 border border-blue-200 dark:border-blue-600 rounded-lg cursor-pointer hover:shadow-lg transition-shadow"
                                                @click="viewImage(selectedTransaction.admin_info.qr_code_url!, 'QR Code ของแอดมิน')"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Payment Details -->
                        <div
                            v-if="
                                selectedTransaction.customer_bank_code ||
                                selectedTransaction.customer_account_number ||
                                selectedTransaction.customer_receive_bank_code
                            "
                            class="space-y-4"
                        >
                            <h5 class="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">ข้อมูลลูกค้า</h5>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <!-- Customer Bank Account -->
                                <div v-if="selectedTransaction.customer_bank_code">
                                    <label class="text-sm text-gray-600 dark:text-gray-400 block mb-1">บัญชีลูกค้า</label>
                                    <div class="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                                        <p class="font-medium">{{ selectedTransaction.customer_account_name || 'ไม่ระบุ' }}</p>
                                        <p class="text-sm text-gray-600 dark:text-gray-400">{{ selectedTransaction.customer_bank_code }}</p>
                                        <p class="font-mono text-sm">{{ selectedTransaction.customer_account_number }}</p>
                                    </div>
                                </div>

                                <!-- Customer Receive Account -->
                                <div v-if="selectedTransaction.customer_receive_bank_code">
                                    <label class="text-sm text-gray-600 dark:text-gray-400 block mb-1">บัญชีปลายทาง</label>
                                    <div class="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                                        <p class="font-medium">{{ selectedTransaction.customer_receive_account_name || 'ไม่ระบุ' }}</p>
                                        <p class="text-sm text-gray-600 dark:text-gray-400">{{ selectedTransaction.customer_receive_bank_code }}</p>
                                        <p class="font-mono text-sm">{{ selectedTransaction.customer_receive_account_number }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Files Section -->
                        <div class="space-y-4">
                            <h5 class="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">ไฟล์แนบ</h5>

                            <div class="space-y-4">
                                <!-- Payment Slips from array -->
                                <div v-if="selectedTransaction.payment_slips && selectedTransaction.payment_slips.length > 0" class="space-y-3">
                                    <h6 class="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        หลักฐานการโอน ({{ selectedTransaction.payment_slips.length }} ไฟล์)
                                    </h6>
                                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        <div
                                            v-for="(slip, index) in selectedTransaction.payment_slips"
                                            :key="index"
                                            class="relative group border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <button @click="viewImage(slip.url, `หลักฐานการโอน ${index + 1}`)" class="w-full text-left space-y-2">
                                                <!-- File preview thumbnail -->
                                                <div
                                                    class="aspect-video bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center overflow-hidden"
                                                >
                                                    <img
                                                        :src="slip.url"
                                                        :alt="slip.file_name"
                                                        class="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                        @error="handleImageError"
                                                    />
                                                    <div class="hidden w-full h-full items-center justify-center text-gray-400">
                                                        <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                                            <path
                                                                fill-rule="evenodd"
                                                                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm8 6a2 2 0 11-4 0 2 2 0 014 0zm-2 4a4 4 0 00-3.464 2H16a1 1 0 001-1.53A4 4 0 0012 13z"
                                                            />
                                                        </svg>
                                                    </div>
                                                </div>

                                                <!-- File info -->
                                                <!-- <div class="space-y-1">
                                                    <p class="text-sm font-medium text-gray-900 dark:text-white truncate" :title="slip.file_name">
                                                        {{ slip.file_name }}
                                                    </p>
                                                    <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                                        <span>{{ formatBytes(slip.file_size) }}</span>
                                                        <span>{{ formatDate(slip.uploaded_at) }}</span>
                                                    </div>
                                                </div> -->
                                            </button>

                                            <!-- View overlay on hover -->
                                            <div
                                                class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none"
                                            >
                                                <span class="text-white text-sm font-medium">คลิกเพื่อดู</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Fallback to old payment_slip_url -->
                                <div v-else-if="selectedTransaction.payment_slip_url" class="space-y-3">
                                    <h6 class="text-sm font-medium text-gray-700 dark:text-gray-300">หลักฐานการโอน</h6>
                                    <button
                                        @click="viewImage(selectedTransaction.payment_slip_url, 'หลักฐานการโอน')"
                                        class="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                                    >
                                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fill-rule="evenodd"
                                                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm8 6a2 2 0 11-4 0 2 2 0 014 0zm-2 4a4 4 0 00-3.464 2H16a1 1 0 001-1.53A4 4 0 0012 13z"
                                            />
                                        </svg>
                                        ดูหลักฐานการโอน
                                    </button>
                                </div>

                                <!-- TXID Screenshot -->
                                <div v-if="selectedTransaction.txid_screenshot_url" class="space-y-3">
                                    <h6 class="text-sm font-medium text-gray-700 dark:text-gray-300">TXID Screenshot</h6>
                                    <button
                                        @click="viewImage(selectedTransaction.txid_screenshot_url, 'TXID Screenshot')"
                                        class="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 rounded-lg transition-colors"
                                    >
                                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm8 6a2 2 0 11-4 0 2 2 0 014 0zm-2 4a4 4 0 00-3.464 2H16a1 1 0 001-1.53A4 4 0 0012 13z"
                                            />
                                        </svg>
                                        ดู TXID Screenshot
                                    </button>
                                </div>

                                <!-- No files indicator -->
                                <div
                                    v-if="
                                        (!selectedTransaction.payment_slips || selectedTransaction.payment_slips.length === 0) &&
                                        !selectedTransaction.payment_slip_url &&
                                        !selectedTransaction.txid_screenshot_url
                                    "
                                    class="text-gray-500 dark:text-gray-400 italic"
                                >
                                    ไม่มีไฟล์แนบ
                                </div>
                            </div>
                        </div>

                        <!-- Admin Notes -->
                        <div v-if="selectedTransaction.admin_notes" class="space-y-4">
                            <h5 class="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">หมายเหตุของแอดมิน</h5>
                            <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                <p class="text-sm">{{ selectedTransaction.admin_notes }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-end mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button @click="closeDetailModal" class="btn btn-outline-primary">ปิด</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Status Update Modal -->
        <div v-if="showStatusModalRef" class="fixed inset-0 z-50 overflow-y-auto">
            <div class="flex items-center justify-center min-h-screen px-4">
                <div class="fixed inset-0 bg-black opacity-50" @click="closeStatusModal"></div>
                <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md z-10">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-lg font-semibold">อัพเดทสถานะธุรกรรม</h3>
                        <button @click="closeStatusModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>

                    <div v-if="selectedTransactionForStatus" class="space-y-4">
                        <!-- Transaction Info -->
                        <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                            <div class="text-sm text-gray-600 dark:text-gray-400">ธุรกรรม</div>
                            <div class="font-medium">{{ selectedTransactionForStatus.order_reference || 'N/A' }}</div>
                            <div class="text-sm text-gray-500 dark:text-gray-400">{{ selectedTransactionForStatus.user_name }}</div>
                        </div>

                        <!-- Current Status -->
                        <div>
                            <label class="text-sm text-gray-600 dark:text-gray-400 block mb-2">สถานะปัจจุบัน</label>
                            <span
                                :class="getStatusClasses(selectedTransactionForStatus.status)"
                                class="px-3 py-1 text-sm rounded-full inline-flex items-center"
                            >
                                <span class="w-2 h-2 rounded-full mr-2" :class="getStatusDotClass(selectedTransactionForStatus.status)"></span>
                                {{ getStatusText(selectedTransactionForStatus.status) }}
                            </span>
                        </div>

                        <!-- New Status Selection -->
                        <div>
                            <label class="text-sm text-gray-600 dark:text-gray-400 block mb-2">เปลี่ยนเป็นสถานะ</label>
                            <CustomDropdown
                                v-model="newStatus"
                                :options="getAvailableStatuses(selectedTransactionForStatus.status)"
                                placeholder="-- เลือกสถานะใหม่ --"
                            />
                        </div>

                        <!-- Admin Notes -->
                        <div>
                            <label class="text-sm text-gray-600 dark:text-gray-400 block mb-2">หมายเหตุ (ไม่บังคับ)</label>
                            <textarea
                                v-model="statusUpdateNotes"
                                placeholder="เพิ่มหมายเหตุเกี่ยวกับการเปลี่ยนสถานะ..."
                                class="form-textarea w-full h-20 resize-none"
                            ></textarea>
                        </div>

                        <!-- Confirmation -->
                        <div v-if="newStatus" class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                            <div class="flex items-start">
                                <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fill-rule="evenodd"
                                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                        clip-rule="evenodd"
                                    />
                                </svg>
                                <div class="text-sm">
                                    <p class="font-medium text-yellow-800 dark:text-yellow-200">ยืนยันการเปลี่ยนสถานะ</p>
                                    <p class="text-yellow-700 dark:text-yellow-300 mt-1">
                                        จะเปลี่ยนสถานะจาก "<span class="font-medium">{{ getStatusText(selectedTransactionForStatus.status) }}</span
                                        >" เป็น "<span class="font-medium">{{ getStatusText(newStatus) }}</span
                                        >"
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button @click="closeStatusModal" class="btn btn-outline-secondary">ยกเลิก</button>
                        <button @click="confirmStatusUpdate" :disabled="!newStatus || isUpdatingStatus" class="btn btn-warning">
                            <span v-if="isUpdatingStatus" class="inline-flex items-center">
                                <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path
                                        class="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                กำลังอัพเดท...
                            </span>
                            <span v-else>ยืนยันการเปลี่ยนสถานะ</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Image Preview Modal -->
        <div v-if="showImageModal" class="fixed inset-0 z-50 overflow-y-auto">
            <div class="flex items-center justify-center min-h-screen px-4 py-8">
                <div class="fixed inset-0 bg-black opacity-75" @click="closeImageModal"></div>
                <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-3xl z-10 max-h-[90vh] overflow-y-auto">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold">{{ imageModalTitle }}</h3>
                        <button @click="closeImageModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    <div class="flex items-center justify-center bg-gray-100 dark:bg-gray-900 rounded-lg p-4">
                        <img
                            :src="imageModalUrl"
                            class="max-w-full max-h-[60vh] w-auto h-auto rounded shadow-lg object-contain"
                            alt="หลักฐาน"
                            style="max-height: 60vh"
                        />
                    </div>
                    <div class="flex justify-center mt-4 gap-2">
                        <button @click="closeImageModal" class="btn btn-outline-primary px-6">ปิด</button>
                        <a :href="imageModalUrl" target="_blank" class="btn btn-primary px-6"> ดูขนาดเต็ม </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, computed, onMounted } from 'vue';
    import { adminAPI, type Transaction } from '~/lib/supabase';
    import { formatDate as formatDateUtil } from '~/utils/dateFormatter';
    import DataTable from '~/components/DataTable.vue';
    import CustomDropdown from '~/components/CustomDropdown.vue';

    // Page Meta
    definePageMeta({
        middleware: 'admin-auth',
    });

    // SEO
    useHead({
        title: 'จัดการธุรกรรม | P2P Exchange Admin',
    });

    // State
    const loading = ref(true);
    const error = ref('');
    const transactions = ref<Transaction[]>([]);
    const searchTerm = ref('');
    const statusFilter = ref('');
    const typeFilter = ref('');
    const showDetailModal = ref(false);
    const selectedTransaction = ref<Transaction | null>(null);
    const showImageModal = ref(false);
    const imageModalUrl = ref('');
    const imageModalTitle = ref('');

    // Status Update Modal State
    const showStatusModalRef = ref(false);
    const selectedTransactionForStatus = ref<Transaction | null>(null);
    const newStatus = ref('');
    const statusUpdateNotes = ref('');
    const isUpdatingStatus = ref(false);

    // Table columns
    const tableColumns = [
        { key: 'transaction', label: 'ธุรกรรม' },
        { key: 'type', label: 'ประเภท' },
        { key: 'user', label: 'ผู้ใช้' },
        { key: 'amount', label: 'จำนวนเงิน' },
        { key: 'network', label: 'เครือข่าย' },
        { key: 'status', label: 'สถานะ' },
        { key: 'created_at', label: 'วันที่สร้าง' },
        { key: 'files', label: 'ไฟล์' },
        { key: 'actions', label: 'การกระทำ' },
    ];

    // Dropdown options
    const statusOptions = [
        { value: '', label: 'ทั้งหมด' },
        { value: 'pending', label: 'รอดำเนินการ' },
        { value: 'processing', label: 'กำลังดำเนินการ' },
        { value: 'completed', label: 'เสร็จสิ้น' },
        { value: 'cancelled', label: 'ยกเลิก' },
    ];

    const typeOptions = [
        { value: '', label: 'ทั้งหมด' },
        { value: 'buy', label: 'ซื้อ USDT' },
        { value: 'sell', label: 'ขาย USDT' },
    ];

    // Computed
    const filteredTransactions = computed(() => {
        let filtered = transactions.value;

        if (searchTerm.value) {
            const search = searchTerm.value.toLowerCase();
            filtered = filtered.filter(
                (transaction) =>
                    transaction.order_reference?.toLowerCase().includes(search) ||
                    transaction.user_name?.toLowerCase().includes(search) ||
                    transaction.id.toLowerCase().includes(search),
            );
        }

        if (statusFilter.value) {
            filtered = filtered.filter((transaction) => transaction.status === statusFilter.value);
        }

        if (typeFilter.value) {
            filtered = filtered.filter((transaction) => transaction.transaction_type === typeFilter.value);
        }

        return filtered;
    });

    // Methods
    const fetchTransactions = async () => {
        try {
            loading.value = true;
            error.value = '';

            const data = await adminAPI.getTransactions();
            transactions.value = data || [];
        } catch (err) {
            console.error('Error fetching transactions:', err);
            error.value = 'เกิดข้อผิดพลาดในการโหลดข้อมูล';
        } finally {
            loading.value = false;
        }
    };

    const resetFilters = () => {
        searchTerm.value = '';
        statusFilter.value = '';
        typeFilter.value = '';
    };

    const formatShortId = (id: string | undefined) => {
        if (!id) return 'N/A';
        return `${id.slice(0, 8)}...`;
    };

    const formatCurrency = (amount: number | string) => {
        const num = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('th-TH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(num);
    };

    const getStatusClasses = (status: string) => {
        const classes = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        };
        return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    };

    const getStatusDotClass = (status: string) => {
        const classes = {
            pending: 'bg-yellow-500',
            processing: 'bg-blue-500',
            completed: 'bg-green-500',
            cancelled: 'bg-red-500',
        };
        return classes[status as keyof typeof classes] || 'bg-gray-500';
    };

    const formatDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return 'ไม่ระบุ';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return 'ไม่ถูกต้อง';
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleImageError = (event: Event) => {
        const target = event.target as HTMLImageElement;
        if (target) {
            target.style.display = 'none';
            const fallback = target.nextElementSibling as HTMLElement;
            if (fallback) {
                fallback.style.display = 'flex';
            }
        }
    };

    const getStatusText = (status: string) => {
        const texts = {
            pending: 'รอดำเนินการ',
            processing: 'กำลังดำเนินการ',
            completed: 'เสร็จสิ้น',
            cancelled: 'ยกเลิก',
        };
        return texts[status as keyof typeof texts] || status;
    };

    const canUpdateStatus = (status: string) => {
        // Allow status updates for all available statuses
        return ['pending', 'processing', 'completed', 'cancelled'].includes(status);
    };

    const viewTransactionDetails = (transaction: Transaction) => {
        selectedTransaction.value = transaction;
        showDetailModal.value = true;
    };

    const closeDetailModal = () => {
        showDetailModal.value = false;
        selectedTransaction.value = null;
    };

    const viewImage = (url: string, title: string) => {
        imageModalUrl.value = url;
        imageModalTitle.value = title;
        showImageModal.value = true;
    };

    const closeImageModal = () => {
        showImageModal.value = false;
        imageModalUrl.value = '';
        imageModalTitle.value = '';
    };

    const showStatusModal = (transaction: Transaction) => {
        selectedTransactionForStatus.value = transaction;
        newStatus.value = '';
        statusUpdateNotes.value = '';
        showStatusModalRef.value = true;
    };

    const closeStatusModal = () => {
        showStatusModalRef.value = false;
        selectedTransactionForStatus.value = null;
        newStatus.value = '';
        statusUpdateNotes.value = '';
    };

    const getAvailableStatuses = (currentStatus: string) => {
        const statusOptions = [
            { value: 'pending', label: 'รอดำเนินการ' },
            { value: 'processing', label: 'กำลังดำเนินการ' },
            { value: 'completed', label: 'เสร็จสิ้น' },
            { value: 'cancelled', label: 'ยกเลิก' },
        ];

        // Return all options except current status
        return statusOptions.filter((option) => option.value !== currentStatus);
    };

    const confirmStatusUpdate = async () => {
        if (!selectedTransactionForStatus.value || !newStatus.value) return;

        try {
            isUpdatingStatus.value = true;

            // Update transaction status via API
            const updatedTransaction = await adminAPI.updateTransactionStatus(selectedTransactionForStatus.value.id, newStatus.value, statusUpdateNotes.value);

            // Update local state with the response from server
            const transactionIndex = transactions.value.findIndex((t) => t.id === selectedTransactionForStatus.value?.id);
            if (transactionIndex !== -1) {
                transactions.value[transactionIndex] = { ...transactions.value[transactionIndex], ...updatedTransaction };
            }

            // Show success message
            console.log('Status updated successfully');

            closeStatusModal();
        } catch (error) {
            console.error('Error updating status:', error);
            // You might want to show an error toast notification here
            alert('เกิดข้อผิดพลาดในการอัพเดทสถานะ');
        } finally {
            isUpdatingStatus.value = false;
        }
    };

    // Lifecycle
    onMounted(async () => {
        await fetchTransactions();
    });
</script>
