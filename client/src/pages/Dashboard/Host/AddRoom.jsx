import AddRoomForm from "../../../components/Form/AddRoomForm";
import useAuth from "../../../hooks/useAuth";
import { uploadImage } from "../../../utils";
import {Helmet} from 'react-helmet-async';
import { useMutation } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import toast from 'react-hot-toast';
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const AddRoom = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure()
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()


  const [dates, setDates] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });

  const {mutateAsync} = useMutation({
    mutationFn: async (roomData) => {
      const {data} = axiosSecure.post('/rooms', roomData);
      return data;
    },
    onSuccess: () => {
      console.log('Room Added Successfully');
      toast.success('Room Added Successfully');
      navigate('/dashboard/my-listings')
      setLoading(false)
    }
  })

  // Date range handler
  const handleDates = (range) => {
    console.log(range);
    setDates(range.selection);
  };

  // Form handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)
    const form = e.target;
    const location = form.location.value;
    const category = form.category.value;
    const title = form.title.value;
    const to = dates.endDate;
    const from = dates.startDate;
    const price = form.price.value;
    const total_guest = form.total_guest.value;
    const bathrooms = form.bathrooms.value;
    const description = form.description.value;
    const bedrooms = form.bedrooms.value;
    const image = form.image.files[0];
    const host = {
      name: user?.displayName,
      image: user?.photoURL,
      email: user?.email,
    };
    try {
      const image_url = await uploadImage(image);
      const roomData = {
        location,
        category,
        title,
        to,
        from,
        price,
        total_guest,
        bathrooms,
        description,
        bedrooms,
        image: image_url,
        host,
      };
      console.table(roomData);
      // Post request to server
      await mutateAsync(roomData)
    } catch (err) {
      console.log(err);
      toast.success(err.message);
      setLoading(false)
    }
  };

  return (
    <>
      <Helmet>
        <title>Add Room | Dashboard</title>
      </Helmet>
      {/* Add room form */}
      <AddRoomForm
        dates={dates}
        handleDates={handleDates}
        handleSubmit={handleSubmit}
        loading={loading}
      />
    </>
  );
};

export default AddRoom;
