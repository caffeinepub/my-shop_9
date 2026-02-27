import Map "mo:core/Map";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";

actor {
  type Product = {
    id : Nat;
    title : Text;
    description : Text;
    price : Nat;
    imageUrl : Text;
    stock : Nat;
    category : Text;
    sellerId : Text;
    createdAt : Text;
  };

  type Order = {
    id : Nat;
    items : [OrderItem];
    buyerName : Text;
    buyerEmail : Text;
    totalPrice : Nat;
    status : Text;
    createdAt : Text;
  };

  type OrderItem = {
    productId : Nat;
    quantity : Nat;
    price : Nat;
  };

  let products = Map.empty<Nat, Product>();
  let orders = Map.empty<Nat, Order>();
  var nextProductId = 1;
  var nextOrderId = 1;

  public shared ({ caller }) func addProduct(product : Product) : async Nat {
    let id = nextProductId;
    let newProduct = {
      product with
      id;
    };
    products.add(id, newProduct);
    nextProductId += 1;
    id;
  };

  public shared ({ caller }) func updateProduct(id : Nat, product : Product) : async () {
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) {
        let updatedProduct = {
          product with
          id;
        };
        products.add(id, updatedProduct);
      };
    };
  };

  public shared ({ caller }) func deleteProduct(id : Nat) : async () {
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) {
        products.remove(id);
      };
    };
  };

  public query ({ caller }) func getProduct(id : Nat) : async ?Product {
    products.get(id);
  };

  public query ({ caller }) func getAllProducts() : async [Product] {
    products.values().toArray();
  };

  public query ({ caller }) func getProductsBySeller(sellerId : Text) : async [Product] {
    products.values().toArray().filter(func(p) { p.sellerId == sellerId });
  };

  public query ({ caller }) func getProductsByCategory(category : Text) : async [Product] {
    products.values().toArray().filter(func(p) { p.category == category });
  };

  public shared ({ caller }) func createOrder(order : Order) : async Nat {
    let id = nextOrderId;
    let newOrder = {
      order with
      id;
    };
    orders.add(id, newOrder);
    nextOrderId += 1;
    id;
  };

  public shared ({ caller }) func updateOrderStatus(id : Nat, status : Text) : async () {
    switch (orders.get(id)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder = {
          order with
          status;
        };
        orders.add(id, updatedOrder);
      };
    };
  };

  public query ({ caller }) func getOrder(id : Nat) : async ?Order {
    orders.get(id);
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    orders.values().toArray();
  };

  public query ({ caller }) func getOrdersByBuyer(email : Text) : async [Order] {
    orders.values().toArray().filter(func(o) { o.buyerEmail == email });
  };

  public query ({ caller }) func getOrdersBySeller(sellerId : Text) : async [Order] {
    orders.values().toArray().filter(
      func(order) {
        order.items.any(func(item) {
          switch (products.get(item.productId)) {
            case (?product) { product.sellerId == sellerId };
            case (null) { false };
          };
        });
      }
    );
  };
};
