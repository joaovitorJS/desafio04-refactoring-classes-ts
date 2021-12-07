import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { FoodsContainer } from './styles';

import { Header } from '../../components/Header';
import Food from '../../components/Food';
import { ModalAddFood } from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';

interface FoodProps {
  id: number;
  name: string;
  description: string;
  price: string;
  available: boolean;
  image: string;
}

type FoodFormProps = Omit<FoodProps, 'id' |'available'>

export function Dashboard () {
  const [foods, setFoods] = useState<FoodProps[]>([]);
  const [editingFood, setEditingFood] = useState<FoodProps>({} as FoodProps);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFoods () {
      const response = await api.get('/foods');

      setFoods(response.data);
    }

    loadFoods();
  }, []);


  async function handleAddFood(food: FoodFormProps) {
    
    try {
      const response = await api.post('/foods', {
        ...food,
        available: true,
      });

      setFoods([...foods, response.data]);
 
    } catch (err) {
      console.log(err);
    }
  }

  async function handleUpdateFood (food: FoodFormProps) {

    try {
      const foodUpdated = await api.put(
        `/foods/${editingFood.id}`,
        { ...editingFood, ...food },
      );

      const foodsUpdated = foods.map(f =>
        f.id !== foodUpdated.data.id ? f : foodUpdated.data,
      );

      setFoods(foodsUpdated);

    } catch (err) {
      console.log(err);
    }
  }

  async function handleDeleteFood (id: number) {

    await api.delete(`/foods/${id}`);

    const foodsFiltered = foods.filter(food => food.id !== id);

    setFoods(foodsFiltered);
  }

  function toggleModal () {
    setModalOpen(!modalOpen);
  }

  function toggleEditModal () {
    setEditModalOpen(!editModalOpen);
  }

  function handleEditFood (food: FoodProps) {
    setEditingFood(food);
    setEditModalOpen(true);
  }

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
}

