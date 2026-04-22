import React from "react";
import ServiceCard from "./ServiceCard";

const ServiceList = ({ services }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      {services.map(service => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
};

export default ServiceList;