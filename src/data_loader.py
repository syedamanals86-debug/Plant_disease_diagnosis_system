from tensorflow.keras.preprocessing.image import ImageDataGenerator

def load_data(train_dir, val_dir):
    train_datagen = ImageDataGenerator(rescale=1./255)
    val_datagen = ImageDataGenerator(rescale=1./255)

    train_data = train_datagen.flow_from_directory(
        train_dir,
        target_size=(224,224),
        batch_size=32,
        class_mode='categorical'
    )

    val_data = val_datagen.flow_from_directory(
        val_dir,
        target_size=(224,224),
        batch_size=32,
        class_mode='categorical'
    )

    return train_data, val_data