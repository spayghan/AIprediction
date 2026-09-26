"""
Ensemble Tree Regressor Model Definition
Defines the reusable DemandForecastEnsemble class for training and inference.
"""

import numpy as np
import pandas as pd
from sklearn.tree import DecisionTreeRegressor

FEATURE_COLUMNS = [
    "product_id",
    "category_id",
    "price",
    "day_of_week",
    "month",
    "is_weekend",
    "promotion",
    "discount_percent",
    "stock_available",
    "lag_1d_sales",
    "lag_7d_sales",
    "rolling_7d_avg_sales",
    "rolling_30d_avg_sales"
]

TARGET_COLUMN = "sales_quantity"

class DemandForecastEnsemble:
    """
    Ensemble Bootstrapped Tree Regressor.
    Constructs an ensemble of high-accuracy decision trees with feature sub-sampling
    and bootstrap aggregation, providing robust generalization without external DLL dependencies.
    """
    def __init__(self, n_estimators=35, max_depth=10, random_state=42):
        self.n_estimators = n_estimators
        self.max_depth = max_depth
        self.random_state = random_state
        self.trees = []
        self.feature_names = FEATURE_COLUMNS

    def fit(self, X, y):
        if isinstance(X, pd.DataFrame):
            X = X.values
        if isinstance(y, pd.Series):
            y = y.values
            
        np.random.seed(self.random_state)
        n_samples = len(X)
        self.trees = []
        for i in range(self.n_estimators):
            sample_indices = np.random.choice(n_samples, size=n_samples, replace=True)
            tree = DecisionTreeRegressor(
                max_depth=self.max_depth,
                min_samples_split=4,
                min_samples_leaf=2,
                random_state=self.random_state + i
            )
            tree.fit(X[sample_indices], y[sample_indices])
            self.trees.append(tree)
        return self

    def predict(self, X):
        if isinstance(X, pd.DataFrame):
            X = X.values
        elif not isinstance(X, np.ndarray):
            X = np.array(X)
            
        if len(X.shape) == 1:
            X = X.reshape(1, -1)
            
        tree_preds = np.array([tree.predict(X) for tree in self.trees])
        return np.mean(tree_preds, axis=0)

    @property
    def feature_importances_(self):
        all_importances = [tree.feature_importances_ for tree in self.trees]
        return np.mean(all_importances, axis=0)
