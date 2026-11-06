from model import build_model
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import json
import os

# Paths
train_dir = '../data/PlantVillageDataset/train_val_test/train'
val_dir = '../data/PlantVillageDataset/train_val_test/val'
output_model_dir = '../models'

# Optional class filter: set this list to train on a specific subset of categories.
# For a simplified 3-class model, choose the 3 dataset folders you want to classify.
selected_classes = None
# selected_classes = [
#     'Pepper__bell___Bacterial_spot',
#     'Pepper__bell___healthy',
#     'Potato___Early_blight'
# ]

os.makedirs(output_model_dir, exist_ok=True)

# Data preprocessing
train_datagen = ImageDataGenerator(
    rescale=1.0 / 255.0,
    rotation_range=30,
    zoom_range=0.2,
    horizontal_flip=True,
    width_shift_range=0.1,
    height_shift_range=0.1
)
val_datagen = ImageDataGenerator(rescale=1.0 / 255.0)
train_data = train_datagen.flow_from_directory(
    train_dir,
    target_size=(224,224),
    batch_size=32,
    class_mode='categorical',
    classes=selected_classes
)

val_data = val_datagen.flow_from_directory(
    val_dir,
    target_size=(224,224),
    batch_size=32,
    class_mode='categorical',
    classes=selected_classes
)

# CNN Model
model = build_model(train_data.num_classes)

# Compile model
model.compile(
    optimizer='adam',
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

# Train model
model.fit(train_data, validation_data=val_data, epochs=5)

# Save model and class metadata
model.save('model.keras')
model.save(os.path.join(output_model_dir, 'model.keras'))

class_names = [None] * len(train_data.class_indices)
for name, index in train_data.class_indices.items():
    class_names[index] = name

with open('class_names.json', 'w', encoding='utf-8') as f:
    json.dump(class_names, f, indent=2)

with open(os.path.join(output_model_dir, 'class_names.json'), 'w', encoding='utf-8') as f:
    json.dump(class_names, f, indent=2)
