import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Thomas Adamson',
    role: 'Client fidèle',
    content: 'Dapibus ultrices in iaculis nunc sed augue lacus viverra vitae. Mauris a diam maecenas sed enim. Egestas diam in arcu cursus euismod quis. Quam quisque id diam vel.',
    rating: 5,
    avatar: '/assets/img/photo-5.jpg'
  },
  {
    id: '2', 
    name: 'Aminata Keita',
    role: 'Restauratrice',
    content: 'Grâce à Livo, mon restaurant a augmenté ses ventes de 40%. La plateforme est intuitive et les livreurs très fiables.',
    rating: 5,
    avatar: '/assets/img/photo-5.jpg'
  },
  {
    id: '3',
    name: 'Boubacar Traoré',
    role: 'Livreur partenaire',
    content: 'Je travaille avec Livo depuis 6 mois. Les revenus sont stables et l\'application est bien conçue pour les livreurs.',
    rating: 4,
    avatar: '/assets/img/photo-5.jpg'
  }
];

const sliderConfig = {
  slidesPerView: 1,
  spaceBetween: 30,
  navigation: {
    nextEl: '.testimonial-next',
    prevEl: '.testimonial-prev',
  },
  autoplay: {
    delay: 5000,
    disableOnInteraction: false,
  },
  loop: true,
  modules: [Navigation, Autoplay]
};

export const TestimonialsSection: React.FC = () => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <i 
        key={index}
        className={`fa-solid fa-star ${
          index < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <section className="reviews-sections gap py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Content Column */}
          <div className="w-full lg:w-1/2">
            <div className="reviews-content">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8 leading-tight">
                Quelques mots de nos clients
              </h2>
              
              <div className="custome">
                <Swiper {...sliderConfig}>
                  {testimonials.map((testimonial) => (
                    <SwiperSlide key={testimonial.id}>
                      <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
                        <h4 className="text-xl text-gray-700 italic leading-relaxed mb-8">
                          "{testimonial.content}"
                        </h4>
                        <div className="flex items-center">
                          <img 
                            alt={testimonial.name} 
                            src={testimonial.avatar} 
                            className="w-16 h-16 rounded-full object-cover mr-4 border-4 border-primary-100"
                          />
                          <div>
                            <h6 className="font-bold text-gray-900 text-lg">
                              {testimonial.name}
                            </h6>
                            <div className="flex items-center gap-1 mt-1 text-yellow-400">
                              {renderStars(testimonial.rating)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
                
                {/* Custom Navigation */}
                <div className="flex items-center gap-4 mt-8">
                  <button
                   type="button"
                   aria-label="Previous testimonial"
                   className="testimonial-prev owl-prev w-10 h-10 flex items-center justify-center bg-primary-500 text-white rounded-full hover:bg-primary-700 transition-all duration-300 shadow-md hover:shadow-xl">
                    <i className="fa-solid fa-arrow-left text-lg"></i>
                  </button>
                  <button
                   type="button"
                   aria-label="Next testimonial"
                   className="testimonial-next owl-next w-10 h-10 flex items-center justify-center bg-primary-500 text-white rounded-full hover:bg-primary-700 transition-all duration-300 shadow-md hover:shadow-xl">
                    <i className="fa-solid fa-arrow-right text-lg"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Image Column */}
          <div className="w-full lg:w-1/2">
            <div className="reviews-img relative">
              <img 
                alt="Happy customers" 
                src="/assets/img/photo-4.png" 
                className="w-full max-w-md mx-auto rounded-3xl shadow-md"
              />
              <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center shadow-md animate-bounce">
                <i className="fa-regular fa-thumbs-up text-2xl text-white"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};