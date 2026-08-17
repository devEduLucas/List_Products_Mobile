import { SafeAreaView } from "react-native-safe-area-context";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
  Modal,
} from "react-native";
import { useState, useEffect } from "react";
import { Products, FilterType } from "../types/Products";
import { saveProducts, loadProducts } from "../services/Storage";

export default function Home() {
  const [products, setProducts] = useState<Products[]>([]);
  const [newTitle, setNewTitle] = useState<string>("");
  const [quantity, setQuantity] = useState<number | string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<FilterType>("pendentes");

  const [editingProduct, setEditingProduct] = useState<Products | null>(null);
  const [editTitle, setEditTitle] = useState<string>("");
  const [editQuantity, setEditQuantity] = useState<number | string>("");

  const totalCount = products.length;
  const completedCount = products.filter((t) => t.completed).length;
  const pendingCount = totalCount - completedCount;
  const productExists = products.some(
    (product) =>
      product.title.toLowerCase() === newTitle.trim().toLowerCase()
  );

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const savedProducts = await loadProducts();
      setProducts(savedProducts);
    } catch (error) {
      console.error("Erro ao inicializar produtos", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProductsWeb = async (id: string) => {
    const confirmed = window.confirm(
      'Tem certeza de que deseja excluir esta tarefa?'
    );

    if (confirmed) {
      const updatedList = products.filter((product) => product.id !== id);
      setProducts(updatedList);
      await saveProducts(updatedList);
    }
  };

  const generateId = (products: Products[]) => {
    const nextId =
      products.length === 0
        ? 1
        : Math.max(...products.map((products) => Number(products.id))) + 1;

    return String(nextId).padStart(3, "0");
  };

  const handleAddProduct = async () => {
    if (!newTitle.trim() || Number(newTitle)) {
      Alert.alert("Atenção", "Digite o nome do produto.");
      return;
    }

    if (Number(quantity) <= 0) {
      Alert.alert("Atenção", "Digite uma quantidade válida.");
      return;
    }

     if (productExists) {
    Alert.alert("Atenção", "Este produto já está na lista.");
    return;
    }

    const newProduct: Products = {
      id: generateId(products),
      title: newTitle.trim(),
      quantidade: Number(quantity),
      completed: false,
      createdAt: new Date().toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const updatedList = [newProduct, ...products];

    setProducts(updatedList);
    await saveProducts(updatedList);

    setNewTitle("");
    setQuantity("");
  };

  const handleOpenEditModal = (product: Products) => {
    setEditingProduct(product);
    setEditTitle(product.title);
    setEditQuantity(product.quantidade);
  };

  const handleSaveEdit = async () => {
    if (!editingProduct) return;

    if (!editTitle.trim()) {
      Alert.alert("Atenção", "O nome do produto não pode ser vazio.");
      return;
    }

    if (editQuantity === "" || Number(editQuantity) <= 0) {
      Alert.alert("Atenção", "Digite uma quantidade válida.");
      return;
    }

    const updatedList = products.map((product) =>
      product.id === editingProduct.id
        ? {
            ...product,
            title: editTitle.trim(),
            quantidade: Number(editQuantity),
          }
        : product
    );

    setProducts(updatedList);
    setEditingProduct(null);
    setEditTitle("");
    setEditQuantity("");

    await saveProducts(updatedList);
  };

  const handleDeleteProduct = (id: string) => {
    Alert.alert(
      "Remover Produto",
      "Tem certeza de que deseja excluir este produto?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            const updatedList = products.filter(
              (product) => product.id !== id
            );

            setProducts(updatedList);
            await saveProducts(updatedList);
          },
        },
      ]
    );
  };

  const handleToggleTask = async (id: string) => {
    const updatedList = products.map((product) =>
      product.id === id
        ? { ...product, completed: !product.completed }
        : product
    );

    setProducts(updatedList);
    await saveProducts(updatedList);
  };

  const filteredTasks = products.filter((product) => {
    if (filter === "pendentes") return !product.completed;
    if (filter === "comprados") return product.completed;
    return true;
  });

  return (
    <SafeAreaView>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meus Produtos</Text>

        <Text style={styles.headerSubtitle}>Persistência local</Text>

        <View style={styles.statsRow}>
          <View style={styles.statBadge}>
            <Text style={styles.statNumber}>{totalCount}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>

          <View style={[styles.statBadge, styles.statBadgePending]}>
            <Text style={[styles.statNumber, styles.statNumberPending]}>
              {pendingCount}
            </Text>

            <Text style={styles.statLabel}>Pendentes</Text>
          </View>

          <View style={[styles.statBadge, styles.statBadgeCompleted]}>
            <Text style={[styles.statNumber, styles.statNumberCompleted]}>
              {completedCount}
            </Text>

            <Text style={styles.statLabel}>Comprados</Text>
          </View>
        </View>
      </View>

      <View style={styles.InputContainer}>
        <TextInput
          style={styles.Input}
          placeholder="Nome do produto..."
          placeholderTextColor="#94A3B8"
          value={newTitle}
          onChangeText={setNewTitle}
        />

        <TextInput
          style={styles.quantityInput}
          placeholder="Qtd."
          placeholderTextColor="#94A3B8"
          value={quantity.toString()}
          onChangeText={setQuantity}
          keyboardType="numeric"
        />

        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddProduct}
          activeOpacity={0.8}
        >
          <Text style={styles.textAddButton}>+ Adicionar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        {(["todas", "pendentes", "comprados"] as FilterType[]).map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filterTab,
              filter === type && styles.filterTabActive,
            ]}
            onPress={() => setFilter(type)}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === type && styles.filterTabTextActive,
              ]}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Carregando produtos</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={[
                styles.card,
                item.completed && styles.cardCompleted,
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  item.completed && styles.checkboxChecked,
                ]}
                onPress={() => handleToggleTask(item.id)}
                activeOpacity={0.7}
              >
                {item.completed && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>

              <View style={styles.textContainer}>
                <Text
                  style={[
                    styles.title,
                    item.completed && styles.titleCompleted,
                  ]}
                  numberOfLines={2}
                >
                  Produto: {item.title}
                </Text>

                <Text
                  style={[
                    styles.quantityText,
                    item.completed && styles.titleCompleted,
                  ]}
                >
                  Quantidade: {item.quantidade}
                </Text>

                <Text style={styles.dateText}>
                  Criada em: {item.createdAt}
                </Text>
              </View>

              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  activeOpacity={0.7}
                  onPress={() => handleOpenEditModal(item)}
                >
                  <Text style={styles.editButtonText}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  activeOpacity={0.7}
                  onPress={() => handleDeleteProductsWeb(item.id)}
                >
                  <Text style={styles.deleteButtonText}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>
                Nenhum Produto Encontrado
              </Text>
            </View>
          }
        />
      )}

      <Modal
        visible={editingProduct !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingProduct(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Produto</Text>

            <TextInput
              style={styles.modalInput}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Nome do produto..."
              autoFocus
            />

            <TextInput
              style={styles.modalInput}
              value={editQuantity.toString()}
              onChangeText={setEditQuantity}
              placeholder="Quantidade..."
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.cancelModalButton,
                ]}
                onPress={() => setEditingProduct(null)}
              >
                <Text style={styles.cancelModalText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.saveModalButton,
                ]}
                onPress={handleSaveEdit}
              >
                <Text style={styles.saveModalText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 18,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },

  headerSubtitle: {
    fontSize: 12,
    color: "#E0E7FF",
    marginTop: 2,
    marginBottom: 16,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },

  statBadge: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  statBadgePending: {
    backgroundColor: "rgba(251, 191, 36, 0.25)",
  },

  statBadgeCompleted: {
    backgroundColor: "rgba(52, 211, 153, 0.25)",
  },

  statNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },

  statNumberPending: {
    color: "#FEF08A",
  },

  statNumberCompleted: {
    color: "#A7F3D0",
  },

  statLabel: {
    fontSize: 11,
    color: "#F8FAFC",
    marginTop: 2,
  },

  InputContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 10,
  },

  Input: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1E293B",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  quantityInput: {
    width: 65,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1E293B",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    textAlign: "center",
  },

  addButton: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  textAddButton: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#6366F1",
  },

  cardCompleted: {
    backgroundColor: "#F8FAFC",
    borderLeftColor: "#10B981",
    opacity: 0.85,
  },

  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#6366F1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  checkboxChecked: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },

  checkmark: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },

  textContainer: {
    flex: 1,
    paddingRight: 8,
  },

  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 4,
  },

  quantityText: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 4,
  },

  titleCompleted: {
    textDecorationLine: "line-through",
    color: "#94A3B8",
  },

  dateText: {
    fontSize: 11,
    color: "#94A3B8",
  },

  listContent: {
    padding: 16,
  },

  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#475569",
  },

  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },

  editButton: {
    backgroundColor: "#EEF2FF",
  },

  editButtonText: {
    color: "#4F46E5",
    fontSize: 12,
    fontWeight: "600",
  },

  deleteButton: {
    backgroundColor: "#EEF2FF",
  },

  deleteButtonText: {
    color: "#F12020",
    fontSize: 12,
    fontWeight: "600",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modalContent: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 14,
  },

  modalInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: "#1E293B",
    marginBottom: 18,
  },

  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },

  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },

  cancelModalButton: {
    backgroundColor: "#F1F5F9",
  },

  cancelModalText: {
    color: "#64748B",
    fontWeight: "600",
  },

  saveModalButton: {
    backgroundColor: "#6366F1",
  },

  saveModalText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 14,
    gap: 8,
  },

  filterTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
  },

  filterTabActive: {
    backgroundColor: "#6366F1",
  },

  filterTabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },

  filterTabTextActive: {
    color: "#FFFFFF",
  },

  aumentarQuantidade: {
    backgroundColor: "#000000",
    width: 20,
    height: 10,
  },
});