<template>
    <div class="admin-part-options-view p-4 md:p-6">
        <div v-if="isLoadingProduct || isLoadingPart" class="text-center py-6">
            <p class="text-gray-600">Loading context...</p>
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto mt-3"></div>
        </div>
        <div v-if="productError || partError"
            class="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong class="font-bold">Error!</strong>
            <span v-if="productError" class="block sm:inline"> {{ productError }}</span>
            <span v-if="partError" class="block sm:inline"> {{ partError }}</span>
            <p v-if="partError"><router-link :to="{ name: 'AdminProductParts', params: { productId: productId } }"
                    class="text-red-700 underline font-medium">Return to Parts List</router-link></p>
            <p v-else-if="productError"><router-link :to="{ name: 'AdminProductList' }"
                    class="text-red-700 underline font-medium">Return to Products List</router-link></p>
        </div>
        <div v-else-if="product && part">
            <div class="mb-4">
                <nav class="text-sm mb-2" aria-label="Breadcrumb">
                    <ol class="list-none p-0 inline-flex space-x-2">
                        <li class="flex items-center">
                            <router-link :to="{ name: 'AdminProductList' }"
                                class="text-gray-500 hover:text-blue-600">Products</router-link>
                            <svg class="fill-current w-3 h-3 mx-2 text-gray-500" xmlns="http://www.w3.org/2000/svg"
                                viewBox=" 0 0 320 512">
                                <path
                                    d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z" />
                            </svg>
                        </li>
                        <li class="flex items-center">
                            <router-link :to="{ name: 'AdminProductParts', params: { productId: productId } }"
                                class="text-gray-500 hover:text-blue-600">{{ product.name }} Parts</router-link>
                            <svg class="fill-current w-3 h-3 mx-2 text-gray-500" xmlns="http://www.w3.org/2000/svg"
                                viewBox=" 0 0 320 512">
                                <path
                                    d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z" />
                            </svg>
                        </li>
                        <li class="flex items-center">
                            <span class="text-gray-700 font-medium">{{ part.name }} Options</span>
                        </li>
                    </ol>
                </nav>
                <h1 class="text-2xl font-bold text-gray-800">
                    Manage Options for Part: <span class="text-blue-600">{{ part.name }}</span> (ID: {{ partId }})
                </h1>
                <p class="text-sm text-gray-600">Product: {{ product.name }} (ID: {{ productId }})</p>
            </div>
            <form @submit.prevent="addOption"
                class="mb-6 p-4 bg-white rounded-lg shadow grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div class="md:col-span-2">
                    <label for="newOptionName" class="block text-sm font-medium text-gray-700">New Option Name</label>
                    <input type="text" id="newOptionName" v-model="newOptionForm.name"
                        placeholder="e.g., Large, Red, Carbon Fiber" required
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        :disabled="isSubmittingOption" />
                </div>
                <div>
                    <label for="newOptionPrice" class="block text-sm font-medium text-gray-700">Price ($)</label>
                    <input type="number" step="0.01" min="0" id="newOptionPrice" v-model.number="newOptionForm.price"
                        required
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        :disabled="isSubmittingOption" />
                </div>
                <div class="flex items-end space-x-3">
                    <div class="flex items-center h-full mb-1">
                        <input id="newOptionInStock" type="checkbox" v-model="newOptionForm.in_stock"
                            class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            :disabled="isSubmittingOption">
                        <label for="newOptionInStock" class="ml-2 block text-sm text-gray-900">In Stock?</label>
                    </div>
                    <button type="submit"
                        class="ml-auto inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 active:bg-green-900 focus:outline-none focus:border-green-900 focus:ring ring-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition ease-in-out duration-150"
                        :disabled="isSubmittingOption || !newOptionForm.name.trim()">
                        <Plus class="w-4 h-4 mr-1 -ml-1" />
                        <span v-if="isSubmittingOption">Adding...</span>
                        <span v-else>Add Option</span>
                    </button>
                </div>
            </form>
            <p v-if="submitStatus" class="mb-4 text-sm" :class="submitError ? 'text-red-600' : 'text-green-600'">
                {{ submitStatus }}
            </p>
            <h2 class="text-xl font-semibold mb-3 text-gray-700">Existing Options</h2>
            <div v-if="isLoadingOptions" class="text-center py-6">
                <p class="text-gray-600">Loading options...</p>
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto mt-3"></div>
            </div>
            <div v-else-if="optionsError"
                class="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong class="font-bold">Error!</strong>
                <span class="block sm:inline"> {{ optionsError }}</span>
            </div>
            <div v-else-if="options.length > 0" class="bg-white shadow overflow-x-auto sm:rounded-lg">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th scope="col"
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name</th>
                            <th scope="col"
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Price</th>
                            <th scope="col"
                                class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                In Stock</th>
                            <th scope="col"
                                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <template v-for="option in options" :key="option.id">
                            <tr v-if="editingOptionId !== option.id" class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ option.name
                                    }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${{
                                    formatPrice(option.price) }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-center text-sm">
                                    <span :class="option.in_stock ? 'text-green-600' : 'text-red-600'">
                                        {{ option.in_stock ? 'Yes' : 'No' }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button @click="startEditing(option)"
                                        class="text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                                        :disabled="isEditing" title="Edit Option">
                                        <Edit class="w-4 h-4" />
                                    </button>
                                    <button @click="deleteOption(option.id)"
                                        class="text-red-600 hover:text-red-900 disabled:opacity-50"
                                        :disabled="isDeleting[option.id] || isEditing" title="Delete Option">
                                        <span v-if="isDeleting[option.id]">
                                            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600">
                                            </div>
                                        </span>
                                        <Trash2 v-else class="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                            <tr v-else class="bg-yellow-50">
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <input type="text" v-model="editFormData.name"
                                        class="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required :disabled="isUpdatingOption" />
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <input type="number" step="0.01" min="0" v-model.number="editFormData.price"
                                        class="w-24 text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required :disabled="isUpdatingOption" />
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-center">
                                    <button @click="editFormData.in_stock = !editFormData.in_stock"
                                        :class="[editFormData.in_stock ? 'bg-green-600' : 'bg-gray-400', 'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500']"
                                        :disabled="isUpdatingOption">
                                        <span class="sr-only">Toggle In Stock</span>
                                        <span aria-hidden="true"
                                            :class="[editFormData.in_stock ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200']"></span>
                                    </button>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button @click="updateOption()"
                                        class="text-green-600 hover:text-green-900 disabled:opacity-50"
                                        :disabled="isUpdatingOption" title="Save Changes">
                                        <span v-if="isUpdatingOption">
                                            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600">
                                            </div>
                                        </span>
                                        <Check v-else class="w-5 h-5" />
                                    </button>
                                    <button @click="cancelEditing()"
                                        class="text-gray-600 hover:text-gray-900 disabled:opacity-50"
                                        :disabled="isUpdatingOption" title="Cancel Editing">
                                        <X class="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>
            <div v-else class="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
                <p class="text-lg text-gray-600">No options found for this part.</p>
                <p class="mt-2 text-sm text-gray-500">Use the form above to add the first option.</p>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import apiService from '../../services/apiService';
import { Plus, Trash2, Settings, Edit, Check, X } from 'lucide-vue-next';
const props = defineProps({
    productId: { type: [String, Number], required: true },
    partId: { type: [String, Number], required: true }
});
const route = useRoute();
const product = ref(null);
const part = ref(null);
const options = ref([]);
const isLoadingProduct = ref(false);
const isLoadingPart = ref(false);
const isLoadingOptions = ref(false);
const productError = ref(null);
const partError = ref(null);
const optionsError = ref(null);
const newOptionForm = reactive({ name: '', price: 0.00, in_stock: true });
const isSubmittingOption = ref(false);
const submitStatus = ref('');
const submitError = ref(false);
const isDeleting = reactive({});
const editingOptionId = ref(null);
const editFormData = reactive({ id: null, name: '', price: 0.00, in_stock: true });
const isUpdatingOption = ref(false);
const isEditing = computed(() => editingOptionId.value !== null);
onMounted(async () => {
    isLoadingProduct.value = true;
    isLoadingPart.value = true;
    isLoadingOptions.value = true;
    productError.value = null;
    partError.value = null;
    optionsError.value = null;
    submitStatus.value = '';
    try {
        const productResponse = await apiService.fetchProductDetails(props.productId);
        if (!productResponse.data) throw new Error(`Product ${props.productId} not found.`);
        product.value = productResponse.data;
    } catch (err) {
        console.error('Failed to fetch product details:', err.response?.data || err.message);
        productError.value = `Failed to load product details (ID: ${props.productId}).`;
    } finally {
        isLoadingProduct.value = false;
    }
    try {
        if (!product.value) throw new Error("Cannot fetch part without product details.");
        const partResponse = await apiService.fetchPartDetails(props.productId, props.partId);
        if (!partResponse.data) throw new Error(`Part ${props.partId} not found.`);
        part.value = partResponse.data;
    } catch (err) {
        console.error('Failed to fetch part details:', err.response?.data || err.message);
        partError.value = `Failed to load part details (ID: ${props.partId}).`;
    } finally {
        isLoadingPart.value = false;
    }
    if (product.value && part.value) {
        try {
            const optionsResponse = await apiService.fetchPartOptions(props.productId, props.partId);
            options.value = optionsResponse.data || [];
        } catch (err) {
            console.error('Failed to fetch options:', err.response?.data || err.message);
            optionsError.value = `Failed to load options for part ID: ${props.partId}.`;
        } finally {
            isLoadingOptions.value = false;
        }
    } else {
        isLoadingOptions.value = false;
    }
});
const formatPrice = (price) => {
    const num = parseFloat(price);
    return isNaN(num) ? '0.00' : num.toFixed(2);
};
async function addOption() {
    if (!newOptionForm.name.trim()) return;
    isSubmittingOption.value = true;
    submitStatus.value = 'Adding option...';
    submitError.value = false;
    const payload = { part_option: { ...newOptionForm } };
    try {
        const response = await apiService.createPartOption(props.productId, props.partId, payload);
        if (response.data) {
            options.value.push(response.data);
            submitStatus.value = 'Option added successfully!';
            newOptionForm.name = '';
            newOptionForm.price = 0.00;
            newOptionForm.in_stock = true;
            setTimeout(() => { submitStatus.value = ''; }, 3000);
        } else {
            throw new Error("API did not return created option data.");
        }
    } catch (err) {
        console.error('Failed to add option:', err.response?.data || err.message);
        submitStatus.value = 'Failed to add option. Please try again.';
        if (err.response?.data?.errors) {
            submitStatus.value += ` Details: ${JSON.stringify(err.response.data.errors)}`;
        }
        submitError.value = true;
    } finally {
        isSubmittingOption.value = false;
    }
}
function startEditing(option) {
    if (isEditing.value) return;
    editingOptionId.value = option.id;
    editFormData.id = option.id;
    editFormData.name = option.name;
    editFormData.price = parseFloat(option.price || 0);
    editFormData.in_stock = option.in_stock;
    submitStatus.value = '';
}
function cancelEditing() {
    editingOptionId.value = null;
    isUpdatingOption.value = false;
}
async function updateOption() {
    if (!editFormData.id || !editFormData.name.trim()) return;
    isUpdatingOption.value = true;
    submitStatus.value = `Updating option ${editFormData.id}...`;
    submitError.value = false;
    const payload = {
        part_option: {
            name: editFormData.name,
            price: editFormData.price,
            in_stock: editFormData.in_stock
        }
    };
    try {
        const response = await apiService.updatePartOption(props.productId, props.partId, editFormData.id, payload);
        const index = options.value.findIndex(opt => opt.id === editFormData.id);
        if (index !== -1 && response.data) {
            options.value[index] = response.data;
        } else if (index !== -1) {
            options.value[index] = { ...options.value[index], ...payload.part_option, id: editFormData.id };
            console.warn("API did not return updated option object, updated manually in list.");
        }
        submitStatus.value = 'Option updated successfully!';
        cancelEditing();
        setTimeout(() => { submitStatus.value = ''; }, 3000);
    } catch (err) {
        console.error('Failed to update option:', err.response?.data || err.message);
        submitStatus.value = 'Failed to update option. Please try again.';
        if (err.response?.data?.errors) {
            submitStatus.value += ` Details: ${JSON.stringify(err.response.data.errors)}`;
        }
        submitError.value = true;
    } finally {
        isUpdatingOption.value = false;
    }
}
async function deleteOption(optionId) {
    if (isEditing.value) return;
    if (!confirm(`Are you sure you want to delete option ID ${optionId}? This might affect existing configurations/orders.`)) {
        return;
    }
    isDeleting[optionId] = true;
    submitStatus.value = `Deleting option ${optionId}...`;
    submitError.value = false;
    try {
        await apiService.deletePartOption(props.productId, props.partId, optionId);
        options.value = options.value.filter(opt => opt.id !== optionId);
        submitStatus.value = `Option ${optionId} deleted successfully.`;
        setTimeout(() => { submitStatus.value = ''; }, 3000);
    } catch (err) {
        console.error(`Failed to delete option ${optionId}:`, err.response?.data || err.message);
        submitStatus.value = `Failed to delete option ${optionId}.`;
        submitError.value = true;
    } finally {
        delete isDeleting[optionId];
    }
}
</script>
<style scoped>
.bg-yellow-50 {
    background-color: #fffbeb;
}
</style>